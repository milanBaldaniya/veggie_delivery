const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, { data: { user: req.user.toPublicJSON() } });
});

const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;

  req.user.name = name;
  if (phone !== undefined) {
    req.user.phone = phone;
  }
  if (address !== undefined) {
    req.user.address = {
      building: address.building || null,
      wing: address.wing || null,
      flat: address.flat || null,
      landmark: address.landmark || null,
    };
  }

  await req.user.save();

  sendSuccess(res, { message: 'Profile updated', data: { user: req.user.toPublicJSON() } });
});

module.exports = { getMe, updateMe };
