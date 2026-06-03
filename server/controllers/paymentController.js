const asyncHandler = require('express-async-handler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Product = require('../models/Product');

// ─── Create Payment Intent ────────────────────────────────────────────────────
// Called from checkout. Validates cart server-side, creates Stripe PaymentIntent
// and a pending Order in MongoDB. The order is fulfilled by the webhook or the
// client-side confirm endpoint.
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { items, shippingAddress, shippingCost } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty.' });
  }

  const requiredFields = ['fullName', 'email', 'phone', 'addressLine', 'city', 'state', 'pincode', 'country'];
  for (const field of requiredFields) {
    if (!shippingAddress?.[field]?.trim()) {
      return res.status(400).json({ success: false, message: `Address field '${field}' is required.` });
    }
  }

  // Server-side price calculation — never trust client amounts
  let subtotal = 0;
  const enrichedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ success: false, message: `Insufficient stock for: ${product.name}` });
    }
    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    const qty = Number(item.quantity) || 1;
    subtotal += price * qty;
    enrichedItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      price,
      quantity: qty,
    });
  }

  const shipping = Number(shippingCost) || (subtotal > 0 ? 15 : 0);
  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const totalAmount = parseFloat((subtotal + shipping + tax).toFixed(2));

  // Stripe requires smallest currency unit (paise for INR)
  const amountInPaise = Math.round(totalAmount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInPaise,
    currency: 'inr',
    automatic_payment_methods: { enabled: true },
    metadata: {
      userId: req.user.id,
      itemCount: enrichedItems.length.toString(),
    },
    description: `NexCart order for ${shippingAddress.fullName}`,
  });

  // Create a pending order so the webhook or confirm endpoint can fulfil it
  const pendingOrder = await Order.create({
    user: req.user.id,
    items: enrichedItems,
    shippingAddress,
    subtotal,
    shippingCost: shipping,
    tax,
    totalAmount,
    paymentStatus: 'pending',
    paymentIntentId: paymentIntent.id,
    paymentMethod: 'stripe',
    status: 'pending',
  });

  return res.status(200).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    orderId: pendingOrder._id,
    breakdown: { subtotal, shipping, tax, totalAmount },
  });
});

// ─── Confirm Payment (client-side fallback) ───────────────────────────────────
// Called after Stripe.confirmPayment resolves successfully on the frontend.
// Verifies payment directly with Stripe — never trusts the client assertion.
const confirmPayment = asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.body;

  if (!paymentIntentId) {
    return res.status(400).json({ success: false, message: 'paymentIntentId is required.' });
  }

  // Verify with Stripe directly
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (intent.status !== 'succeeded') {
    // Mark the order as payment_failed
    const order = await Order.findOne({ paymentIntentId });
    if (order && order.paymentStatus !== 'failed') {
      order.paymentStatus = 'failed';
      order.status = 'payment_failed';
      order.timeline.push({
        status: 'payment_failed',
        timestamp: new Date(),
        note: `Payment failed. Stripe status: ${intent.status}`,
      });
      await order.save();
    }
    return res.status(400).json({
      success: false,
      message: `Payment not confirmed. Current Stripe status: ${intent.status}`,
    });
  }

  const order = await Order.findOne({ paymentIntentId });

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found for this payment.' });
  }

  // Idempotency: already confirmed (webhook may have fired first)
  if (order.paymentStatus === 'paid') {
    return res.status(200).json({ success: true, order, alreadyConfirmed: true });
  }

  order.paymentStatus = 'paid';
  order.amountPaid = order.totalAmount;
  order.transactionDate = new Date();
  order.timeline.push({ status: 'pending', timestamp: new Date(), note: 'Payment confirmed via Stripe.' });
  await order.save();

  return res.status(200).json({ success: true, order });
});

// ─── Get All Payments (Admin) ─────────────────────────────────────────────────
const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Order.find({ paymentIntentId: { $ne: '' } })
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .select('_id user totalAmount amountPaid paymentStatus paymentMethod paymentIntentId transactionDate createdAt status');

  return res.status(200).json({ success: true, payments });
});

// ─── Stripe Webhook ───────────────────────────────────────────────────────────
// Registered in server.js with express.raw() BEFORE express.json() so the
// raw body is preserved for signature verification.
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).send('Missing stripe-signature header.');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw Buffer
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    default:
      // Unhandled event types are fine — acknowledge and ignore
      break;
  }

  return res.status(200).json({ received: true });
};

// ─── Webhook Helpers ──────────────────────────────────────────────────────────

async function handlePaymentSuccess(intent) {
  try {
    const order = await Order.findOne({ paymentIntentId: intent.id });

    if (!order) {
      console.error(`[Webhook] No order found for paymentIntentId: ${intent.id}`);
      return;
    }

    // Idempotency guard
    if (order.paymentStatus === 'paid') {
      console.log(`[Webhook] Order ${order._id} already paid. Skipping.`);
      return;
    }

    order.paymentStatus = 'paid';
    order.amountPaid = intent.amount_received / 100; // paise → rupees
    order.transactionDate = new Date(intent.created * 1000);
    order.paymentMethod = intent.payment_method_types?.[0] || 'card';

    if (!order.timeline?.some((t) => t.note?.includes('Payment confirmed'))) {
      order.timeline.push({
        status: 'pending',
        timestamp: new Date(),
        note: 'Payment confirmed via Stripe webhook.',
      });
    }

    await order.save();
    console.log(`[Webhook] Order ${order._id} payment confirmed.`);
  } catch (err) {
    console.error('[Webhook] handlePaymentSuccess error:', err.message);
  }
}

async function handlePaymentFailed(intent) {
  try {
    const order = await Order.findOne({ paymentIntentId: intent.id });

    if (!order) return;

    order.paymentStatus = 'failed';
    order.status = 'payment_failed';
    order.timeline.push({
      status: 'payment_failed',
      timestamp: new Date(),
      note: `Payment failed: ${intent.last_payment_error?.message || 'Unknown reason'}`,
    });

    await order.save();
    console.log(`[Webhook] Order ${order._id} payment failed.`);
  } catch (err) {
    console.error('[Webhook] handlePaymentFailed error:', err.message);
  }
}

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getAllPayments,
  stripeWebhook,
};
