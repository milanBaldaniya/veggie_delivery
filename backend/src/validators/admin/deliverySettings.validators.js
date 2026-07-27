const yup = require('yup');

const timeSchema = yup.object({
  hour: yup.number().integer().min(0).max(23).required(),
  minute: yup.number().integer().min(0).max(59).required(),
});

const toMinutes = (t) => t.hour * 60 + t.minute;

const updateDeliverySettingsSchema = yup.object({
  deliveryStart: timeSchema.required(),
  deliveryEnd: timeSchema.required(),
  cutoff: timeSchema.required(),
}).test(
  'end-after-start',
  'Delivery end time must be after start time',
  (v) => !v?.deliveryStart || !v?.deliveryEnd || toMinutes(v.deliveryEnd) > toMinutes(v.deliveryStart)
);

module.exports = { updateDeliverySettingsSchema };
