const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/ApiResponse');
const Order = require('../../models/Order');
const User = require('../../models/User');
const Bill = require('../../models/Bill');
const Building = require('../../models/Building');
const { ROLES, ORDER_STATUS, BILL_STATUS, BILL_PERIOD } = require('../../config/constants');
const { weekBounds, getISOWeek, dayBounds, formatDateKey, TZ } = require('../../utils/billingPeriod');

function startOfToday() {
  return dayBounds(new Date()).start;
}
function daysAgo(n) {
  // Plain millisecond subtraction from an IST-midnight instant still lands on
  // an IST-midnight n days earlier since Asia/Kolkata has no DST.
  return new Date(startOfToday().getTime() - n * 24 * 60 * 60 * 1000);
}

// Revenue counts money from orders that weren't cancelled.
const REVENUE_MATCH = { status: { $ne: ORDER_STATUS.CANCELLED } };

const getStats = asyncHandler(async (req, res) => {
  const today = startOfToday();
  const weekStart = daysAgo(6); // last 7 days incl. today
  const monthStart = daysAgo(29);

  const [
    totalOrders,
    todayOrders,
    weekOrders,
    monthOrders,
    revenueAgg,
    statusAgg,
    totalUsers,
    totalWatchmen,
    totalBuildings,
    recentOrders,
    salesSeries,
    billingAgg,
    weeklyBillsSeries,
  ] = await Promise.all([
    Order.countDocuments({}),
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.countDocuments({ createdAt: { $gte: weekStart } }),
    Order.countDocuments({ createdAt: { $gte: monthStart } }),
    Order.aggregate([{ $match: REVENUE_MATCH }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    User.countDocuments({ role: ROLES.CUSTOMER }),
    User.countDocuments({ role: ROLES.WATCHMAN }),
    Building.countDocuments({}),
    Order.find({}).sort({ createdAt: -1 }).limit(8),
    // Per-day orders + revenue for the last 7 days.
    Order.aggregate([
      { $match: { createdAt: { $gte: weekStart } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: TZ } },
          orders: { $sum: 1 },
          revenue: {
            $sum: { $cond: [{ $ne: ['$status', ORDER_STATUS.CANCELLED] }, '$totalAmount', 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    // Weekly billing totals across all weekly bills.
    Bill.aggregate([
      { $match: { periodType: BILL_PERIOD.WEEKLY } },
      {
        $group: {
          _id: null,
          pendingAmount: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } },
          collectedAmount: { $sum: '$paidAmount' },
          pendingBills: { $sum: { $cond: [{ $eq: ['$status', BILL_STATUS.PAID] }, 0, 1] } },
          paidBills: { $sum: { $cond: [{ $eq: ['$status', BILL_STATUS.PAID] }, 1, 0] } },
        },
      },
    ]),
    // Per-week sales summary for the most recent weeks.
    Bill.aggregate([
      { $match: { periodType: BILL_PERIOD.WEEKLY } },
      {
        $group: {
          _id: { start: '$periodStart', end: '$periodEnd', week: '$weekNumber', year: '$weekYear' },
          total: { $sum: '$totalAmount' },
          collected: { $sum: '$paidAmount' },
          orders: { $sum: '$orderCount' },
          bills: { $sum: 1 },
        },
      },
      { $sort: { '_id.start': -1 } },
      { $limit: 8 },
    ]),
  ]);

  // Normalise the status breakdown so every status is present (even at 0).
  const orderStatusStats = Object.values(ORDER_STATUS).reduce((acc, s) => {
    acc[s] = 0;
    return acc;
  }, {});
  statusAgg.forEach((s) => {
    if (s._id) orderStatusStats[s._id] = s.count;
  });

  // Fill missing days in the 7-day series with zeros so charts don't have gaps.
  const seriesByDate = new Map(salesSeries.map((d) => [d._id, d]));
  const salesGraph = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = daysAgo(i);
    const key = formatDateKey(d);
    const entry = seriesByDate.get(key);
    salesGraph.push({ date: key, orders: entry?.orders || 0, revenue: entry?.revenue || 0 });
  }

  // Current active weekly billing cycle (the week today falls in).
  const activeBounds = weekBounds(today);
  const activeIso = getISOWeek(activeBounds.start);
  const bAgg = billingAgg[0] || {};
  const weeklySummary = weeklyBillsSeries
    .map((w) => ({
      weekNumber: w._id.week,
      weekYear: w._id.year,
      periodStart: w._id.start,
      periodEnd: w._id.end,
      total: w.total,
      collected: w.collected,
      pending: Math.max(0, w.total - w.collected),
      orders: w.orders,
      bills: w.bills,
    }))
    .reverse();

  const billing = {
    activeWeek: {
      weekNumber: activeIso.week,
      weekYear: activeIso.year,
      periodStart: activeBounds.start,
      periodEnd: activeBounds.end,
    },
    pendingBills: bAgg.pendingBills || 0,
    paidBills: bAgg.paidBills || 0,
    pendingAmount: Math.max(0, bAgg.pendingAmount || 0),
    collectedAmount: bAgg.collectedAmount || 0,
    weeklySummary,
  };

  sendSuccess(res, {
    data: {
      totals: {
        totalOrders,
        todayOrders,
        weekOrders,
        monthOrders,
        revenue: revenueAgg[0]?.total || 0,
        pendingPayments: billing.pendingAmount,
        totalBuildings,
        totalUsers,
        totalWatchmen,
      },
      orderStatusStats,
      salesGraph,
      billing,
      recentOrders: recentOrders.map((o) => o.toPublicJSON()),
    },
  });
});

module.exports = { getStats };
