const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const Building = require('../models/Building');

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
    // Buildings are curated by the admin (see Building.routes) — a customer
    // must pick one of those, not type an arbitrary name, or building-wise
    // stats/watchman assignment silently stop matching this customer.
    // Only validated when it's actually changing: if the admin later
    // renames/deactivates/removes a building a customer already lives in,
    // that customer must still be able to edit unrelated fields (phone,
    // landmark, ...) without being blocked by a building reference they
    // didn't touch.
    const buildingChanged =
      (address.building || null) !== (req.user.address?.building || null);
    if (address.building && buildingChanged) {
      const escaped = address.building.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const building = await Building.findOne({
        name: { $regex: `^${escaped}$`, $options: 'i' },
        isActive: true,
      });
      if (!building) throw ApiError.badRequest('Please select a valid building/society from the list');
    }
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
