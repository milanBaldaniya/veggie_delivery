const mongoose = require('mongoose');
const { BILL_STATUS, BILL_PERIOD } = require('../config/constants');

const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, default: 'cash' },
    paidAt: { type: Date, default: Date.now },
    note: { type: String, default: null },
  },
  { _id: false }
);

// A snapshot of one order included in the bill, so a weekly "billing card" is
// self-contained and doesn't need to join back to the orders collection to
// render its history.
const billOrderSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    placedAt: { type: Date },
    amount: { type: Number, default: 0 },
    quantityGrams: { type: Number, default: 0 },
  },
  { _id: false }
);

// A weekly/monthly bill aggregating a customer's orders in a period. Weekly
// bills accrue automatically as orders are placed; re-running keeps recorded
// payments intact.
const billSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerName: { type: String, default: null },
    building: { type: String, default: null },
    periodType: { type: String, enum: Object.values(BILL_PERIOD), required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    // ISO week number + ISO year (weekly bills only; null for monthly).
    weekNumber: { type: Number, default: null },
    weekYear: { type: Number, default: null },
    orderCount: { type: Number, default: 0 },
    totalQuantityGrams: { type: Number, default: 0 },
    orders: { type: [billOrderSchema], default: [] },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: Object.values(BILL_STATUS), default: BILL_STATUS.PENDING },
    payments: { type: [paymentSchema], default: [] },
    // Set when the offline payment is collected, plus any admin note.
    paymentCollectedAt: { type: Date, default: null },
    notes: { type: String, default: null },
  },
  { timestamps: true }
);

billSchema.index({ user: 1, periodType: 1, periodStart: 1 }, { unique: true });

billSchema.pre('save', function recomputeStatus(next) {
  if (this.paidAmount <= 0) this.status = BILL_STATUS.PENDING;
  else if (this.paidAmount >= this.totalAmount) this.status = BILL_STATUS.PAID;
  else this.status = BILL_STATUS.PARTIAL;
  next();
});

// Summary shape used in list views — omits the (potentially long) orders array.
billSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    user: this.user,
    customerName: this.customerName,
    building: this.building,
    periodType: this.periodType,
    periodStart: this.periodStart,
    periodEnd: this.periodEnd,
    weekNumber: this.weekNumber,
    weekYear: this.weekYear,
    orderCount: this.orderCount,
    totalQuantityGrams: this.totalQuantityGrams,
    totalAmount: this.totalAmount,
    paidAmount: this.paidAmount,
    balance: Math.max(0, this.totalAmount - this.paidAmount),
    status: this.status,
    paymentCollectedAt: this.paymentCollectedAt,
    notes: this.notes,
    createdAt: this.createdAt,
  };
};

// Full billing card — everything above plus the included orders and payments.
billSchema.methods.toDetailJSON = function toDetailJSON() {
  return {
    ...this.toPublicJSON(),
    orders: this.orders.map((o) => ({
      order: o.order,
      placedAt: o.placedAt,
      amount: o.amount,
      quantityGrams: o.quantityGrams,
    })),
    payments: this.payments,
  };
};

module.exports = mongoose.model('Bill', billSchema);
