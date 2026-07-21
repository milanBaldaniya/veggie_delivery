const mongoose = require('mongoose');

const { Schema } = mongoose;

// A market vendor the vegetables are bought from each morning. Purchase records
// are Expense docs (category VEGETABLE_PURCHASE) that reference the vendor.
const vendorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: null },
    address: { type: String, trim: true, default: null },
    note: { type: String, trim: true, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

vendorSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    name: this.name,
    phone: this.phone,
    address: this.address,
    note: this.note,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Vendor', vendorSchema);
