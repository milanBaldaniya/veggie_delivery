const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const { sendSuccess } = require('../../utils/ApiResponse');
const Order = require('../../models/Order');
const billingService = require('../../services/billingService');
const logger = require('../../utils/logger');
const { getPagination, buildMeta } = require('../../utils/paginate');
const { ORDER_STATUS, ORDER_STATUS_TRANSITIONS } = require('../../config/constants');

// Server-side filtering + pagination. Filters: status, building (society),
// search (customer name/phone), and a date range on createdAt.
const listOrders = asyncHandler(async (req, res) => {
  const { status, building, search, from, to } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = {};
  if (status) filter.status = status;
  if (building) filter['deliveryAddress.building'] = building;
  if (search) {
    filter.$or = [
      { 'deliveryAddress.name': { $regex: search, $options: 'i' } },
      { 'deliveryAddress.phone': { $regex: search, $options: 'i' } },
    ];
  }
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  sendSuccess(res, {
    data: { orders: orders.map((o) => o.toPublicJSON()) },
    meta: buildMeta({ page, limit, total }),
  });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');
  sendSuccess(res, { data: { order: order.toPublicJSON() } });
});

// Advances an order along the allowed lifecycle only (no arbitrary jumps).
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  const allowed = ORDER_STATUS_TRANSITIONS[order.status] || [];
  if (order.status !== status && !allowed.includes(status)) {
    throw ApiError.badRequest(
      `Cannot change status from ${order.status} to ${status}`
    );
  }

  const previousStatus = order.status;
  order.status = status;
  await order.save();

  // Cancelling drops the order out of its week's bill total.
  if (status === ORDER_STATUS.CANCELLED && previousStatus !== ORDER_STATUS.CANCELLED) {
    try {
      await billingService.recomputeWeeklyBill(order.user, order.createdAt);
    } catch (err) {
      logger.error(`Weekly bill recompute failed for cancelled order ${order._id}: ${err.message}`);
    }
  }

  sendSuccess(res, { message: 'Order status updated', data: { order: order.toPublicJSON() } });
});

// Distinct society names present on orders — powers the building filter dropdown.
const listOrderBuildings = asyncHandler(async (req, res) => {
  const buildings = await Order.distinct('deliveryAddress.building');
  sendSuccess(res, { data: { buildings: buildings.filter(Boolean).sort() } });
});

module.exports = { listOrders, getOrder, updateStatus, listOrderBuildings };
