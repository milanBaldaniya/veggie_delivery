const yup = require('yup');
const { EXPENSE_CATEGORIES, BILL_PERIOD } = require('../../config/constants');

// ---- Vendors ----
const createVendorSchema = yup.object({
  name: yup.string().trim().min(2, 'Name is too short').required('Name is required'),
  phone: yup.string().trim().nullable(),
  address: yup.string().trim().nullable(),
  note: yup.string().trim().nullable(),
  isActive: yup.boolean().default(true),
});
const updateVendorSchema = createVendorSchema.clone().shape({
  name: yup.string().trim().min(2, 'Name is too short'),
});

// ---- Expenses ----
const createExpenseSchema = yup.object({
  category: yup.string().oneOf(EXPENSE_CATEGORIES, 'Invalid category').required('Category is required'),
  amount: yup.number().typeError('Amount must be a number').min(0, 'Amount cannot be negative').required('Amount is required'),
  date: yup.date().default(() => new Date()),
  note: yup.string().trim().nullable(),
  vendor: yup.string().trim().nullable(),
});
const updateExpenseSchema = yup.object({
  category: yup.string().oneOf(EXPENSE_CATEGORIES, 'Invalid category'),
  amount: yup.number().typeError('Amount must be a number').min(0),
  date: yup.date(),
  note: yup.string().trim().nullable(),
  vendor: yup.string().trim().nullable(),
});

// ---- Salary ----
const createSalarySchema = yup.object({
  staff: yup.string().trim().required('Staff is required'),
  month: yup.string().matches(/^\d{4}-\d{2}$/, 'Month must be YYYY-MM').required('Month is required'),
  amount: yup.number().typeError('Amount must be a number').min(0).required('Amount is required'),
  advance: yup.number().min(0).default(0),
  note: yup.string().trim().nullable(),
});
const updateSalarySchema = yup.object({
  amount: yup.number().typeError('Amount must be a number').min(0),
  advance: yup.number().min(0),
  note: yup.string().trim().nullable(),
});
const paymentSchema = yup.object({
  amount: yup.number().typeError('Amount must be a number').positive('Amount must be positive').required('Amount is required'),
  method: yup.string().trim().nullable(),
  note: yup.string().trim().nullable(),
});

// ---- Billing ----
const generateBillsSchema = yup.object({
  periodType: yup.string().oneOf(Object.values(BILL_PERIOD), 'Invalid period').required('Period is required'),
  date: yup.date().nullable(),
});

const markPaidSchema = yup.object({
  collectedAt: yup.date().nullable(),
  notes: yup.string().trim().max(500, 'Note is too long').nullable(),
});

module.exports = {
  createVendorSchema,
  updateVendorSchema,
  createExpenseSchema,
  updateExpenseSchema,
  createSalarySchema,
  updateSalarySchema,
  paymentSchema,
  generateBillsSchema,
  markPaidSchema,
};
