const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const SupportSettings = require('../models/SupportSettings');

// Read-only for the app — admin-managed via /admin/support-settings.
const getSupport = asyncHandler(async (req, res) => {
  const doc = await SupportSettings.findOne();
  sendSuccess(res, { data: { settings: doc ? doc.toPublicJSON() : null } });
});

module.exports = { getSupport };
