const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const Building = require('../models/Building');

// Lightweight directory for the customer-facing building picker (onboarding
// address form). Unlike the admin listing, this skips the per-building
// user/order count aggregation — customers don't need it and it isn't worth
// the extra queries on every keystroke of a search.
const listBuildings = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = { isActive: true };
  if (search) filter.name = { $regex: search.trim(), $options: 'i' };

  const buildings = await Building.find(filter)
    .select('name area wings')
    .sort({ name: 1 })
    .limit(100);

  sendSuccess(res, {
    data: {
      buildings: buildings.map((b) => ({ id: b._id, name: b.name, area: b.area, wings: b.wings })),
    },
  });
});

module.exports = { listBuildings };
