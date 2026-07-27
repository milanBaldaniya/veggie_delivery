const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/ApiResponse');
const DeliverySettings = require('../../models/DeliverySettings');

const getDeliverySettings = asyncHandler(async (req, res) => {
  const doc = await DeliverySettings.getSingleton();
  sendSuccess(res, { data: { settings: doc.toPublicJSON() } });
});

const updateDeliverySettings = asyncHandler(async (req, res) => {
  const doc = await DeliverySettings.getSingleton();
  const { deliveryStart, deliveryEnd, cutoff } = req.body;

  doc.deliveryStart = deliveryStart;
  doc.deliveryEnd = deliveryEnd;
  doc.cutoff = cutoff;

  await doc.save();
  sendSuccess(res, { message: 'Delivery settings updated', data: { settings: doc.toPublicJSON() } });
});

module.exports = { getDeliverySettings, updateDeliverySettings };
