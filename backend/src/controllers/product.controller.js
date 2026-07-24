const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const Product = require('../models/Product');

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// Public catalog for customers: only in-stock vegetables, in catalog order,
// paginated and optionally filtered by a search term matched against the
// name and any alternate-language/spelling aliases (e.g. Gujarati "Tameta"
// for Tomato).
const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(req.query.limit) || DEFAULT_LIMIT));
  const { search } = req.query;

  const filter = { inStock: true };
  if (search) {
    const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: regex }, { aliases: regex }];
  }

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort({ sortOrder: 1, name: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  sendSuccess(res, {
    data: {
      products: products.map((p) => p.toPublicJSON()),
      page,
      limit,
      total,
      hasMore: page * limit < total,
    },
  });
});

module.exports = { listProducts };
