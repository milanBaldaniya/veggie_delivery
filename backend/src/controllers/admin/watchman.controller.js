const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const { sendSuccess } = require('../../utils/ApiResponse');
const User = require('../../models/User');
const Building = require('../../models/Building');
const { ROLES, USER_STATUS } = require('../../config/constants');

// Watchmen are WATCHMAN-role users. They can sign into the panel (email +
// password) and are assigned to societies for society-wise delivery.
const listWatchmen = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = { role: ROLES.WATCHMAN };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const watchmen = await User.find(filter).sort({ createdAt: -1 });

  // Which societies each watchman covers.
  const withBuildings = await Promise.all(
    watchmen.map(async (w) => {
      const buildings = await Building.find({ watchman: w._id }).select('name');
      return { ...w.toPublicJSON(), buildings: buildings.map((b) => ({ id: b._id, name: b.name })) };
    })
  );

  sendSuccess(res, { data: { watchmen: withBuildings } });
});

const createWatchman = asyncHandler(async (req, res) => {
  const { name, phone, email, password } = req.body;

  if (email && (await User.findOne({ email: email.toLowerCase() }))) {
    throw ApiError.conflict('A user with this email already exists');
  }
  if (phone && (await User.findOne({ phone }))) {
    throw ApiError.conflict('A user with this phone already exists');
  }

  const watchman = new User({
    name,
    phone: phone || null,
    email: email ? email.toLowerCase() : null,
    role: ROLES.WATCHMAN,
  });
  if (password) await watchman.setPassword(password);
  await watchman.save();

  sendSuccess(res, { statusCode: 201, message: 'Watchman created', data: { watchman: watchman.toPublicJSON() } });
});

const updateWatchman = asyncHandler(async (req, res) => {
  const watchman = await User.findOne({ _id: req.params.id, role: ROLES.WATCHMAN });
  if (!watchman) throw ApiError.notFound('Watchman not found');

  const { name, phone, email, password, status } = req.body;
  if (name !== undefined) watchman.name = name;
  if (phone !== undefined) watchman.phone = phone || null;
  if (email !== undefined) watchman.email = email ? email.toLowerCase() : null;
  if (status !== undefined) watchman.status = status;
  if (password) await watchman.setPassword(password);
  await watchman.save();

  sendSuccess(res, { message: 'Watchman updated', data: { watchman: watchman.toPublicJSON() } });
});

const deleteWatchman = asyncHandler(async (req, res) => {
  const watchman = await User.findOneAndDelete({ _id: req.params.id, role: ROLES.WATCHMAN });
  if (!watchman) throw ApiError.notFound('Watchman not found');
  // Unassign from any societies.
  await Building.updateMany({ watchman: watchman._id }, { $set: { watchman: null } });
  sendSuccess(res, { message: 'Watchman removed', data: { id: req.params.id } });
});

module.exports = { listWatchmen, createWatchman, updateWatchman, deleteWatchman };
