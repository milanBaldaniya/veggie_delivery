const Order = require('../models/Order');
const Bill = require('../models/Bill');
const { weekBounds, getISOWeek } = require('../utils/billingPeriod');
const { ORDER_STATUS, BILL_PERIOD } = require('../config/constants');

// Recomputes a customer's WEEKLY bill for the week containing `ref` by
// aggregating their non-cancelled orders in that window. This is what makes a
// newly placed order show up in "this week's bill" immediately, and makes a
// cancelled order drop back out.
//
// Idempotent and payment-preserving: only totals/count/name/building are
// rewritten, so any offline payments already recorded against the bill stay
// intact (the Bill pre-save hook re-derives PENDING/PARTIAL/PAID from them).
async function recomputeWeeklyBill(userId, ref = new Date()) {
  const { start, end } = weekBounds(ref);

  const [agg] = await Order.aggregate([
    {
      $match: {
        user: userId,
        createdAt: { $gte: start, $lt: end },
        status: { $ne: ORDER_STATUS.CANCELLED },
      },
    },
    { $sort: { createdAt: 1 } },
    // Per-order quantity = sum of its line-item grams.
    { $addFields: { grams: { $sum: '$items.grams' } } },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalAmount' },
        count: { $sum: 1 },
        quantity: { $sum: '$grams' },
        name: { $first: '$deliveryAddress.name' },
        building: { $first: '$deliveryAddress.building' },
        orders: {
          $push: {
            order: '$_id',
            placedAt: '$createdAt',
            amount: '$totalAmount',
            quantityGrams: '$grams',
          },
        },
      },
    },
  ]);

  const total = agg?.total || 0;
  const count = agg?.count || 0;

  let bill = await Bill.findOne({
    user: userId,
    periodType: BILL_PERIOD.WEEKLY,
    periodStart: start,
  });

  // No orders this week and no bill yet — don't create an empty one.
  if (!bill && count === 0) return null;

  const { week, year } = getISOWeek(start);

  if (!bill) {
    bill = new Bill({
      user: userId,
      periodType: BILL_PERIOD.WEEKLY,
      periodStart: start,
      periodEnd: end,
      totalAmount: 0,
    });
  }

  bill.weekNumber = week;
  bill.weekYear = year;
  bill.totalAmount = total;
  bill.orderCount = count;
  bill.totalQuantityGrams = agg?.quantity || 0;
  bill.orders = agg?.orders || [];
  if (agg?.name) bill.customerName = agg.name;
  if (agg?.building) bill.building = agg.building;

  try {
    await bill.save();
  } catch (err) {
    // Two orders in the same week racing to create the bill: the loser hits the
    // unique (user, periodType, periodStart) index. The bill now exists, so a
    // single recompute onto it resolves cleanly.
    if (err.code === 11000) return recomputeWeeklyBill(userId, ref);
    throw err;
  }

  return bill;
}

module.exports = { recomputeWeeklyBill };
