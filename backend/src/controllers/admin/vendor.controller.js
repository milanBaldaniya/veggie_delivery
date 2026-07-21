const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const { sendSuccess } = require('../../utils/ApiResponse');
const Vendor = require('../../models/Vendor');
const Expense = require('../../models/Expense');

const listVendors = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};
  if (search) filter.name = { $regex: search, $options: 'i' };
  const vendors = await Vendor.find(filter).sort({ name: 1 });

  // Attach total purchased so far (sum of linked purchase expenses).
  const withTotals = await Promise.all(
    vendors.map(async (v) => {
      const agg = await Expense.aggregate([
        { $match: { vendor: v._id } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      return { ...v.toPublicJSON(), totalPurchased: agg[0]?.total || 0 };
    })
  );
  sendSuccess(res, { data: { vendors: withTotals } });
});

const createVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.create(req.body);
  sendSuccess(res, { statusCode: 201, message: 'Vendor created', data: { vendor: vendor.toPublicJSON() } });
});

const updateVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) throw ApiError.notFound('Vendor not found');
  Object.assign(vendor, req.body);
  await vendor.save();
  sendSuccess(res, { message: 'Vendor updated', data: { vendor: vendor.toPublicJSON() } });
});

const deleteVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findByIdAndDelete(req.params.id);
  if (!vendor) throw ApiError.notFound('Vendor not found');
  sendSuccess(res, { message: 'Vendor deleted', data: { id: req.params.id } });
});

// Purchase history = expenses linked to this vendor.
const vendorPurchases = asyncHandler(async (req, res) => {
  const purchases = await Expense.find({ vendor: req.params.id }).sort({ date: -1 });
  sendSuccess(res, { data: { purchases: purchases.map((p) => p.toPublicJSON()) } });
});

module.exports = { listVendors, createVendor, updateVendor, deleteVendor, vendorPurchases };
