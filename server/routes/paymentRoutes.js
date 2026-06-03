const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/adminMiddleware');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// ── Stripe Webhook — MUST be raw body, registered in server.js separately ──
// (Do not add auth middleware here — Stripe calls this endpoint directly)

// ── Authenticated user routes ──────────────────────────────────────────────
// Create a PaymentIntent & pending order
router.post('/create-intent', authMiddleware, paymentController.createPaymentIntent);

// Client-side confirm fallback (after Stripe.confirmPayment resolves)
router.post('/confirm', authMiddleware, paymentController.confirmPayment);

// ── Admin routes ───────────────────────────────────────────────────────────
router.get('/admin/all', authMiddleware, requireAdmin, paymentController.getAllPayments);

module.exports = router;
