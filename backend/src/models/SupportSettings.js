const mongoose = require('mongoose');

const { Schema } = mongoose;

// A single FAQ entry shown on the customer app's Help & Support screen.
const faqSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { _id: true }
);

// Singleton (exactly one document ever exists) holding the customer-facing
// support contact details + FAQ list, editable from the admin panel instead
// of being hardcoded into the mobile app build.
const supportSettingsSchema = new Schema(
  {
    callNumber: { type: String, trim: true, default: '' },
    whatsappNumber: { type: String, trim: true, default: '' },
    // Optional full override (e.g. a wa.me link with a pre-filled message) —
    // when blank the app builds a plain wa.me link from whatsappNumber.
    whatsappLink: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    hours: { type: String, trim: true, default: '' },
    faqs: { type: [faqSchema], default: [] },
  },
  { timestamps: true }
);

supportSettingsSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    callNumber: this.callNumber,
    whatsappNumber: this.whatsappNumber,
    whatsappLink: this.whatsappLink,
    email: this.email,
    hours: this.hours,
    faqs: this.faqs.map((f) => ({ id: f._id, question: f.question, answer: f.answer })),
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('SupportSettings', supportSettingsSchema);
