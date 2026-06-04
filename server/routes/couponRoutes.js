const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/adminMiddleware');
const couponController = require('../controllers/couponController');

const router = express.Router();

router.get('/admin', authMiddleware, requireAdmin, couponController.getAllCoupons);
router.post('/admin', authMiddleware, requireAdmin, couponController.createCoupon);
router.put('/admin/:id', authMiddleware, requireAdmin, couponController.updateCoupon);
router.delete('/admin/:id', authMiddleware, requireAdmin, couponController.deleteCoupon);

router.post('/validate', couponController.validateCoupon);
router.post('/remove', couponController.removeCoupon);

module.exports = router;