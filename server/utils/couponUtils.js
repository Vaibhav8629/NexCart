const Coupon = require('../models/Coupon');

const normalizeCouponCode = (code) => String(code || '').trim().toUpperCase();

const roundCurrency = (value) => Number(Number(value || 0).toFixed(2));

const calculateCouponDiscount = (coupon, subtotal) => {
  const amount = Number(subtotal) || 0;

  if (!coupon || amount <= 0) {
    return 0;
  }

  if (coupon.discountType === 'percentage') {
    const discount = amount * (Number(coupon.discountValue) || 0) / 100;
    return roundCurrency(Math.min(amount, discount));
  }

  return roundCurrency(Math.min(amount, Number(coupon.discountValue) || 0));
};

const validateCouponRecord = (coupon, subtotal) => {
  if (!coupon) {
    throw new Error('Invalid Coupon');
  }

  if (!coupon.isActive) {
    throw new Error('Coupon Inactive');
  }

  if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
    throw new Error('Coupon Expired');
  }

  if (Number(coupon.usageLimit) > 0 && Number(coupon.usedCount) >= Number(coupon.usageLimit)) {
    throw new Error('Coupon Usage Limit Reached');
  }

  if ((Number(subtotal) || 0) < Number(coupon.minimumOrderAmount || 0)) {
    throw new Error('Minimum Order Amount Not Reached');
  }

  return coupon;
};

const resolveCouponQuote = async ({ code, subtotal }) => {
  const normalizedCode = normalizeCouponCode(code);

  if (!normalizedCode) {
    return { coupon: null, discountAmount: 0 };
  }

  const coupon = await Coupon.findOne({ code: normalizedCode });
  validateCouponRecord(coupon, subtotal);

  const discountAmount = calculateCouponDiscount(coupon, subtotal);
  return { coupon, discountAmount };
};

const buildCouponSnapshot = (coupon, discountAmount) => {
  if (!coupon) {
    return null;
  }

  return {
    couponId: coupon._id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    minimumOrderAmount: coupon.minimumOrderAmount,
    expiryDate: coupon.expiryDate,
    discountAmount: roundCurrency(discountAmount),
  };
};

const recordCouponUsage = async (order) => {
  if (!order?.coupon?.couponId || order.couponUsageRecorded) {
    return order;
  }

  await Coupon.findByIdAndUpdate(order.coupon.couponId, {
    $inc: { usedCount: 1 },
  });

  order.couponUsageRecorded = true;
  await order.save();
  return order;
};

module.exports = {
  normalizeCouponCode,
  roundCurrency,
  calculateCouponDiscount,
  resolveCouponQuote,
  buildCouponSnapshot,
  recordCouponUsage,
};