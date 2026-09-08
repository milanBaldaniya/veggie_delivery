const sanitizeHtml = require('sanitize-html');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const { sendSuccess } = require('../../utils/ApiResponse');
const LegalContent = require('../../models/LegalContent');
const { LEGAL_CONTENT_TYPES } = require('../../config/constants');

const SANITIZE_OPTIONS = {
  allowedTags: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
    'h1', 'h2', 'h3', 'h4',
    'ul', 'ol', 'li', 'a', 'blockquote', 'span',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
  },
  // Force safe defaults on links regardless of what the editor produced.
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
  },
};

function assertValidType(type) {
  if (!Object.values(LEGAL_CONTENT_TYPES).includes(type)) {
    throw ApiError.badRequest(`Unknown legal content type: ${type}`);
  }
}

// Lazy-create: exactly one document per type, created on first access.
async function getOrCreate(type) {
  let doc = await LegalContent.findOne({ type });
  if (!doc) doc = await LegalContent.create({ type });
  return doc;
}

const listAll = asyncHandler(async (req, res) => {
  const docs = await Promise.all(Object.values(LEGAL_CONTENT_TYPES).map(getOrCreate));
  sendSuccess(res, { data: { items: docs.map((d) => d.toPublicJSON()) } });
});

const getOne = asyncHandler(async (req, res) => {
  assertValidType(req.params.type);
  const doc = await getOrCreate(req.params.type);
  sendSuccess(res, { data: { item: doc.toPublicJSON() } });
});

const updateOne = asyncHandler(async (req, res) => {
  assertValidType(req.params.type);
  const doc = await getOrCreate(req.params.type);
  const { title, contentHtml } = req.body;

  doc.title = title;
  doc.contentHtml = sanitizeHtml(contentHtml, SANITIZE_OPTIONS);
  doc.updatedBy = req.user?._id;

  await doc.save();
  sendSuccess(res, { message: 'Content updated', data: { item: doc.toPublicJSON() } });
});

module.exports = { listAll, getOne, updateOne };
