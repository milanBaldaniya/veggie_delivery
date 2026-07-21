const mongoose = require('mongoose');

const { Schema } = mongoose;

// A single vegetable in the catalog. Priced per kilogram; the customer picks a
// weight at order time and the line total is derived from grams * pricePerKg.
const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    // Emoji stand-in for a product image until real images are uploaded.
    emoji: { type: String, default: '🥬' },
    // Optional real image URL (admin upload); falls back to emoji when null.
    imageUrl: { type: String, default: null },
    category: { type: String, trim: true, default: 'Vegetable' },
    pricePerKg: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'kg' },
    description: { type: String, trim: true, default: null },
    inStock: { type: Boolean, default: true },
    // Sort key so the catalog has a deliberate order (lower = earlier).
    sortOrder: { type: Number, default: 100 },
  },
  { timestamps: true }
);

productSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    name: this.name,
    emoji: this.emoji,
    imageUrl: this.imageUrl,
    category: this.category,
    pricePerKg: this.pricePerKg,
    unit: this.unit,
    description: this.description,
    inStock: this.inStock,
  };
};

module.exports = mongoose.model('Product', productSchema);
