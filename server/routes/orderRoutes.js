const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/adminMiddleware');
const orderController = require('../controllers/orderController');

const router = express.Router();

// ── Specific named paths FIRST (before any :param routes) ──────────────────

// User: place order
router.post('/', authMiddleware, orderController.placeOrder);

// User: get own orders
router.get('/my-orders', authMiddleware, orderController.getMyOrders);

// Admin: stats (must be before /:id to prevent "stats" being treated as an id)
router.get('/admin/stats', authMiddleware, requireAdmin, orderController.getOrderStats);

// Admin: all orders
router.get('/admin/all', authMiddleware, requireAdmin, orderController.getAllOrders);

// Admin: update order status
router.patch('/admin/:id/status', authMiddleware, requireAdmin, orderController.updateOrderStatus);

// ── Param routes LAST ──────────────────────────────────────────────────────

// User: get single order by id
router.get('/:id', authMiddleware, orderController.getOrderById);

// User: cancel order
router.patch('/:id/cancel', authMiddleware, orderController.cancelOrder);

module.exports = router;
