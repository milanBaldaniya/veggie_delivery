const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const { sendSuccess } = require('../../utils/ApiResponse');
const User = require('../../models/User');
const Order = require('../../models/Order');
const Bill = require('../../models/Bill');
const { getPagination, buildMeta } = require('../../utils/paginate');
const { ROLES, USER_STATUS } = require('../../config/constants');

// Customer directory with search + building/status filters + pagination.
const listUsers = asyncHandler(async (req, res) => {
  const { search, building, status } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = { role: ROLES.CUSTOMER };
  if (status) filter.status = status;
  if (building) filter['address.building'] = building;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  sendSuccess(res, {
    data: { users: users.map((u) => u.toPublicJSON()) },
    meta: buildMeta({ page, limit, total }),
  });
});

// Full customer profile + order history + billing history for the detail view.
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: ROLES.CUSTOMER });
  if (!user) throw ApiError.notFound('User not found');

  const [orders, bills] = await Promise.all([
    Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(50),
    Bill.find({ user: user._id }).sort({ periodStart: -1 }),
  ]);

  sendSuccess(res, {
    data: {
      user: user.toPublicJSON(),
      orders: orders.map((o) => o.toPublicJSON()),
      bills: bills.map((b) => b.toPublicJSON()),
    },
  });
});

// Block / unblock (ACTIVE <-> DISABLED). A disabled user is rejected at login.
const setStatus = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: ROLES.CUSTOMER });
  if (!user) throw ApiError.notFound('User not found');

  user.status = req.body.status;
  await user.save();
  sendSuccess(res, {
    message: user.status === USER_STATUS.ACTIVE ? 'User unblocked' : 'User blocked',
    data: { user: user.toPublicJSON() },
  });
});

module.exports = { listUsers, getUser, setStatus };
