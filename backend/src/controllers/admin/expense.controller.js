const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const { sendSuccess } = require('../../utils/ApiResponse');
const Expense = require('../../models/Expense');
const { getPagination, buildMeta } = require('../../utils/paginate');

const listExpenses = asyncHandler(async (req, res) => {
  const { category, from, to } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = {};
  if (category) filter.category = category;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const [expenses, total, sumAgg] = await Promise.all([
    Expense.find(filter).populate('vendor', 'name').sort({ date: -1 }).skip(skip).limit(limit),
    Expense.countDocuments(filter),
    Expense.aggregate([{ $match: filter }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);

  sendSuccess(res, {
    data: { expenses: expenses.map((e) => e.toPublicJSON()), totalAmount: sumAgg[0]?.total || 0 },
    meta: buildMeta({ page, limit, total }),
  });
});

const createExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.create({ ...req.body, createdBy: req.user._id });
  sendSuccess(res, { statusCode: 201, message: 'Expense recorded', data: { expense: expense.toPublicJSON() } });
});

const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) throw ApiError.notFound('Expense not found');
  Object.assign(expense, req.body);
  await expense.save();
  sendSuccess(res, { message: 'Expense updated', data: { expense: expense.toPublicJSON() } });
});

const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByIdAndDelete(req.params.id);
  if (!expense) throw ApiError.notFound('Expense not found');
  sendSuccess(res, { message: 'Expense deleted', data: { id: req.params.id } });
});

// Category totals for a date range — powers the expense summary/report.
const expenseSummary = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const match = {};
  if (from || to) {
    match.date = {};
    if (from) match.date.$gte = new Date(from);
    if (to) match.date.$lte = new Date(to);
  }
  const byCategory = await Expense.aggregate([
    { $match: match },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);
  const total = byCategory.reduce((s, c) => s + c.total, 0);
  sendSuccess(res, {
    data: { byCategory: byCategory.map((c) => ({ category: c._id, total: c.total, count: c.count })), total },
  });
});

module.exports = { listExpenses, createExpense, updateExpense, deleteExpense, expenseSummary };
