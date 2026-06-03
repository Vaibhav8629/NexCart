const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');

// ─── User: Place Order ────────────────────────────────────────────────────────
const placeOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, subtotal, shippingCost, tax, totalAmount } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
  }

  if (!shippingAddress) {
    return res.status(400).json({ success: false, message: 'Shipping address is required.' });
  }

  const requiredFields = ['fullName', 'email', 'phone', 'addressLine', 'city', 'state', 'pincode', 'country'];
  for (const field of requiredFields) {
    if (!shippingAddress[field]?.trim()) {
      return res.status(400).json({ success: false, message: `Shipping address field '${field}' is required.` });
    }
  }

  // Validate & enrich items from DB
  const enrichedItems = [];
  for (const item of items) {
    const product = await Product.findById(item.productId || item._id);
    if (!product) {
      return res.status(404).json({ success: false, message: `Product not found: ${item.productId || item._id}` });
    }
    enrichedItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      price: product.discountPrice > 0 ? product.discountPrice : product.price,
      quantity: Number(item.quantity) || 1,
    });
  }

  const order = await Order.create({
    user: req.user.id,
    items: enrichedItems,
    shippingAddress,
    subtotal: Number(subtotal) || 0,
    shippingCost: Number(shippingCost) || 0,
    tax: Number(tax) || 0,
    totalAmount: Number(totalAmount) || 0,
  });

  return res.status(201).json({
    success: true,
    message: 'Order placed successfully.',
    order,
  });
});

// ─── User: Get My Orders ──────────────────────────────────────────────────────
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  return res.status(200).json({ success: true, orders });
});

// ─── User: Get Single Order ───────────────────────────────────────────────────
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  // Only owner or admin can view
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to view this order.' });
  }

  return res.status(200).json({ success: true, order });
});

// ─── User: Cancel Order ───────────────────────────────────────────────────────
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  if (order.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  if (order.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled.' });
  }

  order.status = 'cancelled';
  order.timeline.push({ status: 'cancelled', timestamp: new Date(), note: 'Order cancelled by customer.' });
  await order.save();

  return res.status(200).json({ success: true, message: 'Order cancelled successfully.', order });
});

// ─── Admin: Get All Orders ────────────────────────────────────────────────────
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  return res.status(200).json({ success: true, orders });
});

// ─── Admin: Update Order Status ───────────────────────────────────────────────
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  const noteMap = {
    packed: 'Order has been packed.',
    shipped: 'Order has been shipped.',
    out_for_delivery: 'Order is out for delivery.',
    delivered: 'Order delivered successfully.',
    cancelled: 'Order cancelled by admin.',
  };

  order.status = status;
  order.timeline.push({ status, timestamp: new Date(), note: noteMap[status] || `Status updated to ${status}.` });

  if (status === 'delivered') {
    order.paymentStatus = 'paid';
  }

  await order.save();

  return res.status(200).json({ success: true, message: 'Order status updated.', order });
});

// ─── Admin: Get Order Stats ───────────────────────────────────────────────────
const getOrderStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  const statusCounts = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  return res.status(200).json({
    success: true,
    stats: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      statusCounts: statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    },
  });
});

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
};
