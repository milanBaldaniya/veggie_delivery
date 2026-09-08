const mongoose = require('mongoose');
const { LEGAL_CONTENT_TYPES } = require('../config/constants');

const { Schema } = mongoose;

// One document per legal/informational content type (Privacy Policy, Terms &
// Conditions, Return & Refund Policy, About Us), editable from the admin
// panel instead of being hardcoded into the mobile app build.
const legalContentSchema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(LEGAL_CONTENT_TYPES),
      required: true,
      unique: true,
    },
    title: { type: String, trim: true, default: '' },
    // Sanitized HTML produced by the admin panel's rich text editor.
    contentHtml: { type: String, default: '' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

legalContentSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    type: this.type,
    title: this.title,
    contentHtml: this.contentHtml,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('LegalContent', legalContentSchema);
