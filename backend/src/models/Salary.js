const mongoose = require('mongoose');
const { SALARY_STATUS } = require('../config/constants');

const { Schema } = mongoose;

// Monthly salary record for a staff member (typically a watchman). Supports an
// advance and partial payments; status is derived on save.
const salarySchema = new Schema(
  {
    staff: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // Month the salary is for, as 'YYYY-MM'.
    month: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    advance: { type: Number, default: 0, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: Object.values(SALARY_STATUS), default: SALARY_STATUS.PENDING },
    note: { type: String, trim: true, default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

salarySchema.index({ staff: 1, month: 1 }, { unique: true });

// Keeps status consistent with the numbers.
salarySchema.pre('save', function recomputeStatus(next) {
  const net = Math.max(0, this.amount - this.advance);
  if (this.paidAmount <= 0) this.status = SALARY_STATUS.PENDING;
  else if (this.paidAmount >= net) this.status = SALARY_STATUS.PAID;
  else this.status = SALARY_STATUS.PARTIAL;
  next();
});

salarySchema.methods.toPublicJSON = function toPublicJSON() {
  const net = Math.max(0, this.amount - this.advance);
  return {
    id: this._id,
    staff: this.staff, // populated to { id, name, role, phone }
    month: this.month,
    amount: this.amount,
    advance: this.advance,
    netPayable: net,
    paidAmount: this.paidAmount,
    balance: Math.max(0, net - this.paidAmount),
    status: this.status,
    note: this.note,
    paidAt: this.paidAt,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Salary', salarySchema);
