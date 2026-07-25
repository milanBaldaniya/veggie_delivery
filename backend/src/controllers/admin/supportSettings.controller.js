const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/ApiResponse');
const SupportSettings = require('../../models/SupportSettings');

// Singleton: exactly one settings document, created on first access.
async function getSingleton() {
  let doc = await SupportSettings.findOne();
  if (!doc) doc = await SupportSettings.create({});
  return doc;
}

const getSupportSettings = asyncHandler(async (req, res) => {
  const doc = await getSingleton();
  sendSuccess(res, { data: { settings: doc.toPublicJSON() } });
});

const updateSupportSettings = asyncHandler(async (req, res) => {
  const doc = await getSingleton();
  const { callNumber, whatsappNumber, whatsappLink, email, hours, faqs } = req.body;

  doc.callNumber = callNumber;
  doc.whatsappNumber = whatsappNumber;
  doc.whatsappLink = whatsappLink;
  doc.email = email;
  doc.hours = hours;
  doc.faqs = faqs;

  await doc.save();
  sendSuccess(res, { message: 'Support settings updated', data: { settings: doc.toPublicJSON() } });
});

module.exports = { getSupportSettings, updateSupportSettings };
