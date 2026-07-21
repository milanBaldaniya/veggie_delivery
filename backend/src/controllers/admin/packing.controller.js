const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/ApiResponse');
const Order = require('../../models/Order');
const { ORDER_STATUS } = require('../../config/constants');

function dayBounds(dateStr) {
  const base = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(base);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

// Customer-wise packing lists for a day: each order with its items so the team
// can pack per customer. Grouped by society for society-wise delivery.
const packingList = asyncHandler(async (req, res) => {
  const { start, end } = dayBounds(req.query.date);
  const statuses = [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PACKED, ORDER_STATUS.OUT_FOR_DELIVERY];

  const orders = await Order.find({
    createdAt: { $gte: start, $lt: end },
    status: { $in: statuses },
  }).sort({ 'deliveryAddress.building': 1, 'deliveryAddress.flat': 1 });

  const lists = orders.map((o) => ({
    orderId: o._id,
    shortId: String(o._id).slice(-6).toUpperCase(),
    customerName: o.deliveryAddress?.name,
    phone: o.deliveryAddress?.phone,
    building: o.deliveryAddress?.building,
    wing: o.deliveryAddress?.wing,
    flat: o.deliveryAddress?.flat,
    status: o.status,
    items: o.items.map((i) => ({ name: i.name, emoji: i.emoji, grams: i.grams })),
  }));

  sendSuccess(res, {
    data: { date: start.toISOString().slice(0, 10), count: lists.length, lists },
  });
});

// Simulates the nightly 12 AM cutoff: confirms every PENDING order placed today
// so the purchase report + packing can proceed. Normally a cron does this.
const closeOrdersForDay = asyncHandler(async (req, res) => {
  const { start, end } = dayBounds(req.body.date);
  const result = await Order.updateMany(
    { createdAt: { $gte: start, $lt: end }, status: ORDER_STATUS.PENDING },
    { $set: { status: ORDER_STATUS.CONFIRMED } }
  );
  sendSuccess(res, {
    message: `Confirmed ${result.modifiedCount} order(s) for the day`,
    data: { confirmed: result.modifiedCount },
  });
});

module.exports = { packingList, closeOrdersForDay };
