const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');
const {
  normalizeCouponCode,
  roundCurrency,
  resolveCouponQuote,
  buildCouponSnapshot,
} = require('../utils/couponUtils');

const serializeCoupon = (coupon) => ({
  ...coupon.toObject(),
  discountLabel:
    coupon.discountType === 'percentage'
      ? `${coupon.discountValue}%`
      : `₹${coupon.discountValue}`,
  remainingUses:
    Number(coupon.usageLimit) > 0 ? Math.max(Number(coupon.usageLimit) - Number(coupon.usedCount), 0) : null,
});

const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    discountType,
    discountValue,
    minimumOrderAmount = 0,
    expiryDate,
    isActive = true,
    usageLimit = 0,
  } = req.body;

  const normalizedCode = normalizeCouponCode(code);

  if (!normalizedCode) {
    return res.status(400).json({ success: false, message: 'Coupon code is required.' });
  }

  if (!['percentage', 'fixed'].includes(discountType)) {
    return res.status(400).json({ success: false, message: 'discountType must be percentage or fixed.' });
  }

  const parsedDiscountValue = Number(discountValue);
  const parsedMinimumOrderAmount = Number(minimumOrderAmount) || 0;
  const parsedUsageLimit = Number(usageLimit) || 0;
  const expiry = expiryDate ? new Date(expiryDate) : null;

  if (!Number.isFinite(parsedDiscountValue) || parsedDiscountValue <= 0) {
    return res.status(400).json({ success: false, message: 'discountValue must be greater than 0.' });
  }

  if (!expiry || Number.isNaN(expiry.getTime())) {
    return res.status(400).json({ success: false, message: 'expiryDate is required.' });
  }

  const existing = await Coupon.findOne({ code: normalizedCode });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Coupon code already exists.' });
  }

  const coupon = await Coupon.create({
    code: normalizedCode,
    discountType,
    discountValue: roundCurrency(parsedDiscountValue),
    minimumOrderAmount: roundCurrency(parsedMinimumOrderAmount),
    expiryDate: expiry,
    isActive: Boolean(isActive),
    usageLimit: parsedUsageLimit,
  });

  return res.status(201).json({ success: true, message: 'Coupon created successfully.', coupon: serializeCoupon(coupon) });
});

const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Coupon not found.' });
  }

  if (req.body.code !== undefined) {
    const normalizedCode = normalizeCouponCode(req.body.code);
    if (!normalizedCode) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }

    const duplicate = await Coupon.findOne({ code: normalizedCode, _id: { $ne: coupon._id } });
    if (duplicate) {
      return res.status(409).json({ success: false, message: 'Coupon code already exists.' });
    }

    coupon.code = normalizedCode;
  }

  if (req.body.discountType !== undefined) {
    if (!['percentage', 'fixed'].includes(req.body.discountType)) {
      return res.status(400).json({ success: false, message: 'discountType must be percentage or fixed.' });
    }
    coupon.discountType = req.body.discountType;
  }

  if (req.body.discountValue !== undefined) {
    const parsedDiscountValue = Number(req.body.discountValue);
    if (!Number.isFinite(parsedDiscountValue) || parsedDiscountValue <= 0) {
      return res.status(400).json({ success: false, message: 'discountValue must be greater than 0.' });
    }
    coupon.discountValue = roundCurrency(parsedDiscountValue);
  }

  if (req.body.minimumOrderAmount !== undefined) {
    coupon.minimumOrderAmount = roundCurrency(Number(req.body.minimumOrderAmount) || 0);
  }

  if (req.body.expiryDate !== undefined) {
    const expiry = new Date(req.body.expiryDate);
    if (Number.isNaN(expiry.getTime())) {
      return res.status(400).json({ success: false, message: 'expiryDate is required.' });
    }
    coupon.expiryDate = expiry;
  }

  if (typeof req.body.isActive === 'boolean') {
    coupon.isActive = req.body.isActive;
  }

  if (req.body.usageLimit !== undefined) {
    coupon.usageLimit = Math.max(Number(req.body.usageLimit) || 0, 0);
  }

  await coupon.save();

  return res.status(200).json({ success: true, message: 'Coupon updated successfully.', coupon: serializeCoupon(coupon) });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Coupon not found.' });
  }

  await coupon.deleteOne();
  return res.status(200).json({ success: true, message: 'Coupon deleted successfully.' });
});

const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  return res.status(200).json({ success: true, coupons: coupons.map(serializeCoupon) });
});

const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const parsedSubtotal = Number(subtotal) || 0;
  try {
    const { coupon, discountAmount } = await resolveCouponQuote({ code, subtotal: parsedSubtotal });

    return res.status(200).json({
      success: true,
      message: 'Coupon applied successfully.',
      coupon: buildCouponSnapshot(coupon, discountAmount),
      discountAmount,
      subtotal: roundCurrency(parsedSubtotal),
      subtotalAfterDiscount: roundCurrency(Math.max(parsedSubtotal - discountAmount, 0)),
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || 'Invalid Coupon' });
  }
});

const removeCoupon = asyncHandler(async (req, res) => {
  return res.status(200).json({ success: true, message: 'Coupon removed successfully.' });
});

module.exports = {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCoupons,
  validateCoupon,
  removeCoupon,
};