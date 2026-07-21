const mongoose = require('mongoose');
const { ORDER_STATUS } = require('../config/constants');

const { Schema } = mongoose;

// Each item snapshots the product's name/emoji/price at order time so the order
// stays historically accurate even if the catalog later changes.
const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    emoji: { type: String, default: '🥬' },
    pricePerKg: { type: Number, required: true },
    grams: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

// Delivery address is snapshotted from the customer's profile at order time, so
// the customer never re-enters it and the vendor sees where to deliver.
const deliveryAddressSchema = new Schema(
  {
    name: { type: String, default: null },
    phone: { type: String, default: null },
    building: { type: String, default: null },
    wing: { type: String, default: null },
    flat: { type: String, default: null },
    landmark: { type: String, default: null },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    deliveryAddress: { type: deliveryAddressSchema, required: true },
    status: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PENDING },
  },
  { timestamps: true }
);

orderSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    items: this.items.map((i) => ({
      productId: i.product,
      name: i.name,
      emoji: i.emoji,
      pricePerKg: i.pricePerKg,
      grams: i.grams,
      lineTotal: i.lineTotal,
    })),
    totalAmount: this.totalAmount,
    deliveryAddress: this.deliveryAddress,
    status: this.status,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Order', orderSchema);
