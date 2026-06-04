const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');

// ─── Helper: recalculate and persist product rating + numReviews ──────────────
async function updateProductRating(productId) {
  const result = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (result.length === 0) {
    await Product.findByIdAndUpdate(productId, { rating: 0, numReviews: 0 });
  } else {
    const { avgRating, count } = result[0];
    await Product.findByIdAndUpdate(productId, {
      rating: parseFloat(avgRating.toFixed(1)),
      numReviews: count,
    });
  }
}

// ─── POST /api/reviews ────────────────────────────────────────────────────────
// Create a new review. One per user per product.
const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;

  if (!productId || !rating || !comment?.trim()) {
    return res.status(400).json({ success: false, message: 'productId, rating, and comment are required.' });
  }

  const ratingNum = Number(rating);
  if (ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const existing = await Review.findOne({ user: req.user.id, product: productId });
  if (existing) {
    return res.status(409).json({ success: false, message: 'You have already reviewed this product.' });
  }

  // Fetch user name from DB since JWT only carries id/email/role
  const userDoc = await User.findById(req.user.id).select('name');
  if (!userDoc) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const review = await Review.create({
    product: productId,
    user: req.user.id,
    name: userDoc.name,
    rating: ratingNum,
    comment: comment.trim(),
  });

  await updateProductRating(product._id);

  return res.status(201).json({ success: true, message: 'Review submitted.', review });
});

// ─── PUT /api/reviews/:id ─────────────────────────────────────────────────────
// Update own review.
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found.' });
  }

  if (review.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to edit this review.' });
  }

  const { rating, comment } = req.body;

  if (rating !== undefined) {
    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }
    review.rating = ratingNum;
  }

  if (comment !== undefined) {
    if (!comment.trim()) {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty.' });
    }
    review.comment = comment.trim();
  }

  const updated = await review.save();
  await updateProductRating(review.product);

  return res.status(200).json({ success: true, message: 'Review updated.', review: updated });
});

// ─── DELETE /api/reviews/:id ──────────────────────────────────────────────────
// Delete own review.
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found.' });
  }

  if (review.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this review.' });
  }

  const productId = review.product;
  await review.deleteOne();
  await updateProductRating(productId);

  return res.status(200).json({ success: true, message: 'Review deleted.' });
});

// ─── GET /api/reviews/product/:productId ─────────────────────────────────────
// Get paginated reviews for a product, newest first.
const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(20, parseInt(req.query.limit) || 5);
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('user name rating comment createdAt'),
    Review.countDocuments({ product: productId }),
  ]);

  return res.status(200).json({
    success: true,
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  });
});

// ─── DELETE /api/reviews/admin/:id ───────────────────────────────────────────
// Admin: delete any review.
const adminDeleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found.' });
  }

  const productId = review.product;
  await review.deleteOne();
  await updateProductRating(productId);

  return res.status(200).json({ success: true, message: 'Review removed by admin.' });
});

// ─── GET /api/reviews/admin/all ──────────────────────────────────────────────
// Admin: get all reviews across all products.
const adminGetAllReviews = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('product', 'name images')
      .populate('user', 'name email'),
    Review.countDocuments(),
  ]);

  return res.status(200).json({
    success: true,
    reviews,
    pagination: { page, limit, total, pages: Math.ceil(total / limit), hasMore: page * limit < total },
  });
});

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getProductReviews,
  adminDeleteReview,
  adminGetAllReviews,
};
