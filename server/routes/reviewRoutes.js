const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/adminMiddleware');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

// ── Admin routes (specific paths BEFORE :id param) ────────────────────────────
router.get('/admin/all', authMiddleware, requireAdmin, reviewController.adminGetAllReviews);
router.delete('/admin/:id', authMiddleware, requireAdmin, reviewController.adminDeleteReview);

// ── Public ─────────────────────────────────────────────────────────────────────
router.get('/product/:productId', reviewController.getProductReviews);

// ── Authenticated user routes ──────────────────────────────────────────────────
router.post('/', authMiddleware, reviewController.createReview);
router.put('/:id', authMiddleware, reviewController.updateReview);
router.delete('/:id', authMiddleware, reviewController.deleteReview);

module.exports = router;
