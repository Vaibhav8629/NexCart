const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/adminMiddleware');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', authMiddleware, requireAdmin, productController.createProduct);
router.put('/:id', authMiddleware, requireAdmin, productController.updateProduct);
router.delete('/:id', authMiddleware, requireAdmin, productController.deleteProduct);

module.exports = router;