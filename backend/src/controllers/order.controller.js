const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const Product = require('../models/Product');
const Order = require('../models/Order');
const orderWindow = require('../utils/orderWindow');
const billingService = require('../services/billingService');
const logger = require('../utils/logger');
const { ORDER_STATUS } = require('../config/constants');

const round2 = (n) => Math.round(n * 100) / 100;

// Creates an order from a list of { productId, grams }. Prices and totals are
// computed here from the catalog — never trusted from the client — and the
// delivery address is snapshotted from the customer's profile.
const createOrder = asyncHandler(async (req, res) => {
  const { items } = req.body;

  // Orders are only accepted before the daily cutoff (default 12 PM).
  const window = orderWindow.getWindowStatus();
  if (!window.isOpen) {
    throw ApiError.forbidden(window.message);
  }

  if (!req.user.hasDeliverableAddress()) {
    throw ApiError.badRequest('Please add your delivery address before ordering');
  }

  // Merge duplicate product lines (same veg added twice) into one.
  const gramsByProduct = new Map();
  for (const item of items) {
    gramsByProduct.set(item.productId, (gramsByProduct.get(item.productId) || 0) + item.grams);
  }

  const productIds = [...gramsByProduct.keys()];
  const products = await Product.find({ _id: { $in: productIds }, inStock: true });
  const productById = new Map(products.map((p) => [String(p._id), p]));

  const orderItems = [];
  for (const [productId, grams] of gramsByProduct) {
    const product = productById.get(String(productId));
    if (!product) {
      throw ApiError.badRequest('One or more items are no longer available');
    }
    orderItems.push({
      product: product._id,
      name: product.name,
      emoji: product.emoji,
      pricePerKg: product.pricePerKg,
      grams,
      lineTotal: round2((grams / 1000) * product.pricePerKg),
    });
  }

  const totalAmount = round2(orderItems.reduce((sum, i) => sum + i.lineTotal, 0));

  const { address } = req.user;
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalAmount,
    // Orders are auto-confirmed on placement — no manual admin approval — so
    // they immediately count toward the customer's weekly bill.
    status: ORDER_STATUS.CONFIRMED,
    deliveryAddress: {
      name: req.user.name,
      phone: req.user.phone,
      building: address?.building || null,
      wing: address?.wing || null,
      flat: address?.flat || null,
      landmark: address?.landmark || null,
    },
  });

  // Roll the new order into its week's running bill straight away so the
  // customer sees it under Bills. Never fail a placed order over a billing
  // hiccup — the admin can always regenerate.
  try {
    await billingService.recomputeWeeklyBill(req.user._id, order.createdAt);
  } catch (err) {
    logger.error(`Weekly bill accrual failed for order ${order._id}: ${err.message}`);
  }

  sendSuccess(res, {
    statusCode: 201,
    message: 'Order placed successfully',
    data: { order: order.toPublicJSON() },
  });
});

const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  sendSuccess(res, { data: { orders: orders.map((o) => o.toPublicJSON()) } });
});

// Lets the app show/hide the "order window closed" state without guessing from
// the (spoofable) device clock — the server is the single source of truth.
const getOrderWindow = asyncHandler(async (req, res) => {
  sendSuccess(res, { data: { window: orderWindow.getWindowStatus() } });
});

module.exports = { createOrder, listMyOrders, getOrderWindow };
