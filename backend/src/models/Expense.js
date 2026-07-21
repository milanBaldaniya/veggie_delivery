const mongoose = require('mongoose');
const { EXPENSE_CATEGORIES } = require('../config/constants');

const { Schema } = mongoose;

// A single business expense. Daily/weekly/monthly reports aggregate these by
// category and date range.
const expenseSchema = new Schema(
  {
    category: { type: String, enum: EXPENSE_CATEGORIES, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now, index: true },
    note: { type: String, trim: true, default: null },
    vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

expenseSchema.methods.toPublicJSON = function toPublicJSON() {
  const v = this.vendor;
  const vendor = v && v._id ? { id: v._id, name: v.name } : v;
  return {
    id: this._id,
    category: this.category,
    amount: this.amount,
    date: this.date,
    note: this.note,
    vendor,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Expense', expenseSchema);
