const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, { data: { user: req.user.toPublicJSON() } });
});

const updateMe = asyncHandler(async (req, res) => {
  const { name, building, wing, flat } = req.body;

  req.user.name = name;
  if (building !== undefined) req.user.building = building || null;
  if (wing !== undefined) req.user.wing = wing || null;
  if (flat !== undefined) req.user.flat = flat || null;

  await req.user.save();

  sendSuccess(res, { message: 'Profile updated', data: { user: req.user.toPublicJSON() } });
});

module.exports = { getMe, updateMe };
