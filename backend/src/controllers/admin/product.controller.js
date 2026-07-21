const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const { sendSuccess } = require('../../utils/ApiResponse');
const Product = require('../../models/Product');

// Admin catalog: returns ALL products (in and out of stock), unlike the
// customer endpoint which only lists in-stock items.
const listProducts = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};
  if (search) filter.name = { $regex: search, $options: 'i' };

  const products = await Product.find(filter).sort({ sortOrder: 1, name: 1 });
  sendSuccess(res, { data: { products: products.map((p) => p.toPublicJSON()) } });
});

const createProduct = asyncHandler(async (req, res) => {
  const exists = await Product.findOne({ name: req.body.name });
  if (exists) throw ApiError.conflict('A product with this name already exists');

  const product = await Product.create(req.body);
  sendSuccess(res, {
    statusCode: 201,
    message: 'Product created',
    data: { product: product.toPublicJSON() },
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  Object.assign(product, req.body);
  await product.save();
  sendSuccess(res, { message: 'Product updated', data: { product: product.toPublicJSON() } });
});

// Toggles or explicitly sets availability (daily open/close of a vegetable).
const toggleProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  product.inStock = typeof req.body.inStock === 'boolean' ? req.body.inStock : !product.inStock;
  await product.save();
  sendSuccess(res, {
    message: product.inStock ? 'Product enabled' : 'Product disabled',
    data: { product: product.toPublicJSON() },
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  sendSuccess(res, { message: 'Product deleted', data: { id: req.params.id } });
});

module.exports = { listProducts, createProduct, updateProduct, toggleProduct, deleteProduct };
