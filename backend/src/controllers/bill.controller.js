const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const Bill = require('../models/Bill');

// Customer-facing, read-only view of one's own weekly/monthly bills. Payments
// are collected offline and recorded by staff via the admin panel — customers
// only see the running balance and payment history here.
const listMyBills = asyncHandler(async (req, res) => {
  const bills = await Bill.find({ user: req.user._id }).sort({ periodStart: -1, createdAt: -1 });
  const totalDue = bills.reduce(
    (sum, b) => sum + Math.max(0, b.totalAmount - b.paidAmount),
    0
  );

  sendSuccess(res, {
    data: { bills: bills.map((b) => b.toPublicJSON()), totalDue },
  });
});

const getMyBill = asyncHandler(async (req, res) => {
  // Scoped to the requester so one customer can't read another's bill by id.
  const bill = await Bill.findOne({ _id: req.params.id, user: req.user._id });
  if (!bill) throw ApiError.notFound('Bill not found');

  sendSuccess(res, { data: { bill: bill.toDetailJSON() } });
});

module.exports = { listMyBills, getMyBill };
