const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const LegalContent = require('../models/LegalContent');
const { LEGAL_CONTENT_TYPES } = require('../config/constants');

// Read-only for the app — admin-managed via /admin/legal-content. Public
// (no auth) since Terms/Privacy must be viewable before login too.
const getLegalContent = asyncHandler(async (req, res) => {
  const { type } = req.params;
  if (!Object.values(LEGAL_CONTENT_TYPES).includes(type)) {
    throw ApiError.badRequest(`Unknown legal content type: ${type}`);
  }
  const doc = await LegalContent.findOne({ type });
  sendSuccess(res, { data: { content: doc ? doc.toPublicJSON() : null } });
});

module.exports = { getLegalContent };
