const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const { sendSuccess } = require('../../utils/ApiResponse');
const Order = require('../../models/Order');
const Bill = require('../../models/Bill');
const billingService = require('../../services/billingService');
const { getPagination, buildMeta } = require('../../utils/paginate');
const { ORDER_STATUS, BILL_STATUS, BILL_PERIOD } = require('../../config/constants');
const { weekBounds, monthBounds } = require('../../utils/billingPeriod');

// Reconciles bills for a period. Weekly bills already accrue automatically as
// orders are placed, so this is a safety-net resync; monthly bills are built on
// demand here. Idempotent — recorded payments are preserved.
const generateBills = asyncHandler(async (req, res) => {
  const { periodType, date } = req.body;
  const ref = date ? new Date(date) : new Date();

  if (periodType === BILL_PERIOD.WEEKLY) {
    const { start, end } = weekBounds(ref);
    const userIds = await Order.distinct('user', {
      createdAt: { $gte: start, $lt: end },
      status: { $ne: ORDER_STATUS.CANCELLED },
    });

    let count = 0;
    for (const uid of userIds) {
      if (!uid) continue;
      const bill = await billingService.recomputeWeeklyBill(uid, ref);
      if (bill) count += 1;
    }

    return sendSuccess(res, {
      message: `Synced ${count} weekly bill(s)`,
      data: { count, periodStart: start, periodEnd: end },
    });
  }

  // Monthly aggregation.
  const { start, end } = monthBounds(ref);
  const groups = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lt: end }, status: { $ne: ORDER_STATUS.CANCELLED } } },
    {
      $group: {
        _id: '$user',
        total: { $sum: '$totalAmount' },
        count: { $sum: 1 },
        name: { $first: '$deliveryAddress.name' },
        building: { $first: '$deliveryAddress.building' },
      },
    },
  ]);

  let created = 0;
  let updated = 0;
  for (const g of groups) {
    if (!g._id) continue;
    const existing = await Bill.findOne({ user: g._id, periodType: BILL_PERIOD.MONTHLY, periodStart: start });
    if (existing) {
      existing.totalAmount = g.total;
      existing.orderCount = g.count;
      existing.customerName = g.name;
      existing.building = g.building;
      await existing.save();
      updated += 1;
    } else {
      await Bill.create({
        user: g._id,
        customerName: g.name,
        building: g.building,
        periodType: BILL_PERIOD.MONTHLY,
        periodStart: start,
        periodEnd: end,
        totalAmount: g.total,
        orderCount: g.count,
      });
      created += 1;
    }
  }

  return sendSuccess(res, {
    message: `Generated ${created} and updated ${updated} bill(s)`,
    data: { created, updated, periodStart: start, periodEnd: end },
  });
});

const listBills = asyncHandler(async (req, res) => {
  const { periodType, status, building, search, week } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = {};
  if (periodType) filter.periodType = periodType;
  if (status) filter.status = status;
  if (building) filter.building = building;
  if (week) filter.weekNumber = Number(week);
  if (search) {
    const rx = { $regex: search, $options: 'i' };
    filter.$or = [{ customerName: rx }, { building: rx }];
    // A numeric search also matches the week number.
    if (/^\d+$/.test(search.trim())) filter.$or.push({ weekNumber: Number(search) });
  }

  const [bills, total, totalsAgg] = await Promise.all([
    Bill.find(filter).sort({ periodStart: -1, createdAt: -1 }).skip(skip).limit(limit),
    Bill.countDocuments(filter),
    Bill.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          pending: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } },
          collected: { $sum: '$paidAmount' },
          grand: { $sum: '$totalAmount' },
          pendingCount: { $sum: { $cond: [{ $eq: ['$status', BILL_STATUS.PAID] }, 0, 1] } },
          paidCount: { $sum: { $cond: [{ $eq: ['$status', BILL_STATUS.PAID] }, 1, 0] } },
        },
      },
    ]),
  ]);

  const t = totalsAgg[0] || {};
  sendSuccess(res, {
    data: {
      bills: bills.map((b) => b.toPublicJSON()),
      totals: {
        pendingAmount: Math.max(0, t.pending || 0),
        collectedAmount: t.collected || 0,
        grandTotal: t.grand || 0,
        pendingCount: t.pendingCount || 0,
        paidCount: t.paidCount || 0,
      },
      // Back-compat alias.
      totalDue: Math.max(0, t.pending || 0),
    },
    meta: buildMeta({ page, limit, total }),
  });
});

const getBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);
  if (!bill) throw ApiError.notFound('Bill not found');
  sendSuccess(res, { data: { bill: bill.toDetailJSON() } });
});

// Offline collection: settle the whole outstanding balance in one action and
// stamp when it was collected.
const markAsPaid = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);
  if (!bill) throw ApiError.notFound('Bill not found');
  if (bill.status === BILL_STATUS.PAID) throw ApiError.badRequest('Bill is already paid');

  const balance = Math.max(0, bill.totalAmount - bill.paidAmount);
  if (balance > 0) {
    bill.payments.push({ amount: balance, method: 'cash', note: req.body.notes || 'Marked as paid' });
    bill.paidAmount = bill.totalAmount;
  }
  bill.paymentCollectedAt = req.body.collectedAt ? new Date(req.body.collectedAt) : new Date();
  if (req.body.notes) bill.notes = req.body.notes;

  await bill.save();
  sendSuccess(res, { message: 'Bill marked as paid', data: { bill: bill.toDetailJSON() } });
});

// Partial / manual payment (kept for flexibility alongside Mark as Paid).
const recordPayment = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);
  if (!bill) throw ApiError.notFound('Bill not found');

  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) throw ApiError.badRequest('Enter a valid payment amount');

  bill.payments.push({ amount, method: req.body.method || 'cash', note: req.body.note || null });
  bill.paidAmount += amount;
  if (bill.paidAmount >= bill.totalAmount && !bill.paymentCollectedAt) {
    bill.paymentCollectedAt = new Date();
  }
  await bill.save();
  sendSuccess(res, { message: 'Payment recorded', data: { bill: bill.toDetailJSON() } });
});

module.exports = { generateBills, listBills, getBill, markAsPaid, recordPayment };
