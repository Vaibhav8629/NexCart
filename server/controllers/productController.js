const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

const normalizeImages = (images = []) =>
  images.map((image) => image?.trim()).filter(Boolean);

const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    discountPrice,
    category,
    brand,
    stock,
    images,
    featured,
  } = req.body;

  if (!name || !description || price === undefined || !category || stock === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Name, description, price, category, and stock are required.',
    });
  }

  const product = await Product.create({
    name: name.trim(),
    description: description.trim(),
    price: Number(price),
    discountPrice: Number(discountPrice || 0),
    category: category.trim(),
    brand: brand?.trim() || '',
    stock: Number(stock),
    images: normalizeImages(Array.isArray(images) ? images : []),
    featured: Boolean(featured),
    createdBy: req.user.id,
  });

  return res.status(201).json({
    success: true,
    message: 'Product created successfully.',
    product,
  });
});

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    products,
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found.',
    });
  }

  return res.status(200).json({
    success: true,
    product,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found.',
    });
  }

  const {
    name,
    description,
    price,
    discountPrice,
    category,
    brand,
    stock,
    images,
    featured,
  } = req.body;

  if (name !== undefined) product.name = name.trim();
  if (description !== undefined) product.description = description.trim();
  if (price !== undefined) product.price = Number(price);
  if (discountPrice !== undefined) product.discountPrice = Number(discountPrice);
  if (category !== undefined) product.category = category.trim();
  if (brand !== undefined) product.brand = brand?.trim() || '';
  if (stock !== undefined) product.stock = Number(stock);
  if (images !== undefined) product.images = normalizeImages(Array.isArray(images) ? images : []);
  if (featured !== undefined) product.featured = Boolean(featured);

  const updatedProduct = await product.save();

  return res.status(200).json({
    success: true,
    message: 'Product updated successfully.',
    product: updatedProduct,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found.',
    });
  }

  await product.deleteOne();

  return res.status(200).json({
    success: true,
    message: 'Product deleted successfully.',
  });
});

const getInventoryStats = asyncHandler(async (req, res) => {
  const [total, outOfStock, lowStock] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ stock: 0 }),
    Product.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
  ]);

  return res.status(200).json({
    success: true,
    stats: { total, outOfStock, lowStock, inStock: total - outOfStock - lowStock },
  });
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getInventoryStats,
};