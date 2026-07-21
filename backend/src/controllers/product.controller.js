const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const Product = require('../models/Product');

// Public catalog for customers: only in-stock vegetables, in catalog order.
const listProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ inStock: true }).sort({ sortOrder: 1, name: 1 });
  sendSuccess(res, { data: { products: products.map((p) => p.toPublicJSON()) } });
});

module.exports = { listProducts };
