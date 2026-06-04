const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const couponSnapshotSchema = new mongoose.Schema(
  {
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    code: { type: String, trim: true },
    discountType: { type: String, enum: ['percentage', 'fixed'] },
    discountValue: { type: Number, min: 0 },
    minimumOrderAmount: { type: Number, min: 0 },
    expiryDate: { type: Date },
    discountAmount: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: 'Order must have at least one item.',
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    coupon: {
      type: couponSnapshotSchema,
      default: null,
    },
    couponUsageRecorded: {
      type: Boolean,
      default: false,
    },
    // ── Payment fields ──────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      default: 'stripe',
    },
    paymentIntentId: {
      type: String,
      default: '',
      index: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    transactionDate: {
      type: Date,
    },
    // ── Order status ─────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'payment_failed'],
      default: 'pending',
      index: true,
    },
    estimatedDelivery: { type: Date },
    // Prevents double stock deduction if both webhook and confirm endpoint fire
    stockDeducted: { type: Boolean, default: false },
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Auto-populate timeline on create
orderSchema.pre('save', function (next) {
  if (this.isNew) {
    this.timeline = [{ status: 'pending', timestamp: new Date(), note: 'Order placed successfully.' }];
    // Estimate delivery = 5 days
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + 5);
    this.estimatedDelivery = delivery;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
