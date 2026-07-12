const mongoose = require('mongoose');
const { ROLES, USER_STATUS } = require('../config/constants');

const { Schema } = mongoose;

const otpSchema = new Schema(
  {
    codeHash: { type: String, default: null },
    expiresAt: { type: Date, default: null },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: null },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    role: { type: String, enum: Object.values(ROLES), default: ROLES.CUSTOMER },
    name: { type: String, trim: true, default: null },
    // unique: true already builds an index — adding index: true too triggers
    // Mongoose's "Duplicate schema index" warning at connect time.
    phone: { type: String, required: true, unique: true, trim: true },
    isPhoneVerified: { type: Boolean, default: false },
    otp: { type: otpSchema, default: () => ({}) },

    // Assigned in the Buildings/Wings/Flats phase; left optional until that
    // phase exists so profile setup here only requires a name.
    building: { type: Schema.Types.ObjectId, ref: 'Building', default: null },
    wing: { type: Schema.Types.ObjectId, ref: 'Wing', default: null },
    flat: { type: Schema.Types.ObjectId, ref: 'Flat', default: null },

    status: { type: String, enum: Object.values(USER_STATUS), default: USER_STATUS.ACTIVE },
    fcmToken: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    role: this.role,
    name: this.name,
    phone: this.phone,
    isPhoneVerified: this.isPhoneVerified,
    building: this.building,
    wing: this.wing,
    flat: this.flat,
    status: this.status,
    isProfileComplete: Boolean(this.name),
  };
};

module.exports = mongoose.model('User', userSchema);
