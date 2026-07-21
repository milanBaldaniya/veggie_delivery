const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const { sendSuccess } = require('../../utils/ApiResponse');
const Salary = require('../../models/Salary');
const User = require('../../models/User');
const { ROLES } = require('../../config/constants');

const STAFF_FIELDS = 'name phone role email';

const listSalaries = asyncHandler(async (req, res) => {
  const { month, status, staff } = req.query;
  const filter = {};
  if (month) filter.month = month;
  if (status) filter.status = status;
  if (staff) filter.staff = staff;

  const salaries = await Salary.find(filter).populate('staff', STAFF_FIELDS).sort({ month: -1, createdAt: -1 });
  sendSuccess(res, { data: { salaries: salaries.map((s) => s.toPublicJSON()) } });
});

// Staff members eligible for a salary record (watchmen + management roles).
const eligibleStaff = asyncHandler(async (req, res) => {
  const staff = await User.find({
    role: { $in: [ROLES.WATCHMAN, ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.SUPER_ADMIN] },
  }).select(STAFF_FIELDS);
  sendSuccess(res, { data: { staff: staff.map((s) => ({ id: s._id, name: s.name, role: s.role, phone: s.phone })) } });
});

const createSalary = asyncHandler(async (req, res) => {
  const { staff, month } = req.body;
  const exists = await Salary.findOne({ staff, month });
  if (exists) throw ApiError.conflict('A salary record for this staff & month already exists');

  const salary = await Salary.create(req.body);
  await salary.populate('staff', STAFF_FIELDS);
  sendSuccess(res, { statusCode: 201, message: 'Salary record created', data: { salary: salary.toPublicJSON() } });
});

const updateSalary = asyncHandler(async (req, res) => {
  const salary = await Salary.findById(req.params.id);
  if (!salary) throw ApiError.notFound('Salary record not found');
  const { amount, advance, note } = req.body;
  if (amount !== undefined) salary.amount = amount;
  if (advance !== undefined) salary.advance = advance;
  if (note !== undefined) salary.note = note;
  await salary.save();
  await salary.populate('staff', STAFF_FIELDS);
  sendSuccess(res, { message: 'Salary updated', data: { salary: salary.toPublicJSON() } });
});

// Records a (partial) payment against the net payable.
const paySalary = asyncHandler(async (req, res) => {
  const salary = await Salary.findById(req.params.id);
  if (!salary) throw ApiError.notFound('Salary record not found');

  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) throw ApiError.badRequest('Enter a valid payment amount');

  salary.paidAmount += amount;
  salary.paidAt = new Date();
  await salary.save();
  await salary.populate('staff', STAFF_FIELDS);
  sendSuccess(res, { message: 'Payment recorded', data: { salary: salary.toPublicJSON() } });
});

const deleteSalary = asyncHandler(async (req, res) => {
  const salary = await Salary.findByIdAndDelete(req.params.id);
  if (!salary) throw ApiError.notFound('Salary record not found');
  sendSuccess(res, { message: 'Salary record deleted', data: { id: req.params.id } });
});

module.exports = { listSalaries, eligibleStaff, createSalary, updateSalary, paySalary, deleteSalary };
