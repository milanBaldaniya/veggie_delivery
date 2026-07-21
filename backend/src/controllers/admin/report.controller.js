const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/ApiResponse');
const Order = require('../../models/Order');
const Expense = require('../../models/Expense');
const { ORDER_STATUS } = require('../../config/constants');

// Shared date-range parser: defaults to the last 30 days.
function rangeFrom(query) {
  const to = query.to ? new Date(query.to) : new Date();
  const from = query.from ? new Date(query.from) : new Date(to.getTime() - 29 * 86400000);
  from.setHours(0, 0, 0, 0);
  return { from, to };
}
const NOT_CANCELLED = { status: { $ne: ORDER_STATUS.CANCELLED } };

function dayBounds(dateStr) {
  // Defaults to today when no date is supplied.
  const base = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(base);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

// Total quantity required per vegetable for a given day — the shopping list the
// admin buys against at ~4 AM. Aggregates every non-cancelled order that day.
const dailyPurchase = asyncHandler(async (req, res) => {
  const { start, end } = dayBounds(req.query.date);

  const rows = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lt: end }, status: { $ne: ORDER_STATUS.CANCELLED } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        emoji: { $first: '$items.emoji' },
        pricePerKg: { $first: '$items.pricePerKg' },
        totalGrams: { $sum: '$items.grams' },
        estimatedCost: { $sum: '$items.lineTotal' },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { name: 1 } },
  ]);

  const items = rows.map((r) => ({
    productId: r._id,
    name: r.name,
    emoji: r.emoji,
    pricePerKg: r.pricePerKg,
    totalGrams: r.totalGrams,
    totalKg: Math.round((r.totalGrams / 1000) * 1000) / 1000,
    estimatedCost: Math.round(r.estimatedCost * 100) / 100,
    orderCount: r.orderCount,
  }));

  sendSuccess(res, {
    data: {
      date: start.toISOString().slice(0, 10),
      items,
      totalEstimatedCost: Math.round(items.reduce((s, i) => s + i.estimatedCost, 0) * 100) / 100,
      totalProducts: items.length,
    },
  });
});

// Day-by-day sales (orders + revenue) over a range.
const salesReport = asyncHandler(async (req, res) => {
  const { from, to } = rangeFrom(req.query);
  const rows = await Order.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to }, ...NOT_CANCELLED } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        orders: { $sum: 1 },
        revenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const totals = rows.reduce((a, r) => ({ orders: a.orders + r.orders, revenue: a.revenue + r.revenue }), {
    orders: 0,
    revenue: 0,
  });
  sendSuccess(res, { data: { rows: rows.map((r) => ({ date: r._id, orders: r.orders, revenue: r.revenue })), totals } });
});

// Revenue + orders grouped by society.
const buildingWiseSales = asyncHandler(async (req, res) => {
  const { from, to } = rangeFrom(req.query);
  const rows = await Order.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to }, ...NOT_CANCELLED } },
    { $group: { _id: '$deliveryAddress.building', orders: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
    { $sort: { revenue: -1 } },
  ]);
  sendSuccess(res, {
    data: { rows: rows.map((r) => ({ building: r._id || 'Unknown', orders: r.orders, revenue: r.revenue })) },
  });
});

// Total quantity + revenue consumed per product over a range.
const productConsumption = asyncHandler(async (req, res) => {
  const { from, to } = rangeFrom(req.query);
  const rows = await Order.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to }, ...NOT_CANCELLED } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.name',
        emoji: { $first: '$items.emoji' },
        totalGrams: { $sum: '$items.grams' },
        revenue: { $sum: '$items.lineTotal' },
      },
    },
    { $sort: { revenue: -1 } },
  ]);
  sendSuccess(res, {
    data: {
      rows: rows.map((r) => ({
        name: r._id,
        emoji: r.emoji,
        totalKg: Math.round((r.totalGrams / 1000) * 1000) / 1000,
        revenue: Math.round(r.revenue * 100) / 100,
      })),
    },
  });
});

// Revenue vs. expenses → profit/loss for a range.
const profitAndLoss = asyncHandler(async (req, res) => {
  const { from, to } = rangeFrom(req.query);
  const [revAgg, expAgg, expByCat] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to }, ...NOT_CANCELLED } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Expense.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]),
  ]);
  const revenue = revAgg[0]?.total || 0;
  const expenses = expAgg[0]?.total || 0;
  sendSuccess(res, {
    data: {
      revenue,
      expenses,
      profit: Math.round((revenue - expenses) * 100) / 100,
      expenseByCategory: expByCat.map((c) => ({ category: c._id, total: c.total })),
    },
  });
});

module.exports = {
  dailyPurchase,
  salesReport,
  buildingWiseSales,
  productConsumption,
  profitAndLoss,
};
