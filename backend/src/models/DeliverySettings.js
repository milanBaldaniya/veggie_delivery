const mongoose = require('mongoose');

const { Schema } = mongoose;

// A single time-of-day value, e.g. { hour: 6, minute: 0 } => 6:00 AM.
const timeOfDaySchema = new Schema(
  {
    hour: { type: Number, min: 0, max: 23, required: true },
    minute: { type: Number, min: 0, max: 59, required: true },
  },
  { _id: false }
);

// Singleton (exactly one document ever exists) holding the customer-facing
// delivery window + order cutoff time, editable from the admin panel instead
// of being hardcoded into an env var / the mobile app build.
const deliverySettingsSchema = new Schema(
  {
    deliveryStart: { type: timeOfDaySchema, default: () => ({ hour: 6, minute: 0 }) },
    deliveryEnd: { type: timeOfDaySchema, default: () => ({ hour: 9, minute: 0 }) },
    // Orders accepted only strictly before this time of day. A stored value of
    // 00:00 (midnight) is treated as end-of-day by orderWindow.js, i.e.
    // "accepted all day" — see effectiveCutoffMinutes there.
    cutoff: { type: timeOfDaySchema, default: () => ({ hour: 12, minute: 0 }) },
  },
  { timestamps: true }
);

deliverySettingsSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    deliveryStart: this.deliveryStart,
    deliveryEnd: this.deliveryEnd,
    cutoff: this.cutoff,
    updatedAt: this.updatedAt,
  };
};

// Singleton: exactly one settings document, created on first access. Shared
// by the admin controller and orderWindow.js so both read/write the same doc.
deliverySettingsSchema.statics.getSingleton = async function getSingleton() {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

module.exports = mongoose.model('DeliverySettings', deliverySettingsSchema);
