const mongoose = require('mongoose');

const { Schema } = mongoose;

// A society/building the service delivers to. Customers reference it by the
// free-text `address.building` name today; this directory lets the admin manage
// societies, assign a watchman, and see building-wise stats.
const buildingSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, trim: true, uppercase: true, default: null },
    area: { type: String, trim: true, default: null },
    wings: { type: [String], default: [] },
    // The watchman (a WATCHMAN-role user) responsible for society-wise delivery.
    watchman: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

buildingSchema.methods.toPublicJSON = function toPublicJSON() {
  // Normalise a populated watchman to { id, name, phone } (Mongoose docs expose
  // `_id`, but the frontend keys off `id`); leave a bare ObjectId as-is.
  const w = this.watchman;
  const watchman = w && w._id ? { id: w._id, name: w.name, phone: w.phone, email: w.email } : w;
  return {
    id: this._id,
    name: this.name,
    code: this.code,
    area: this.area,
    wings: this.wings,
    watchman,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Building', buildingSchema);
