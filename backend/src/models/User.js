const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, USER_STATUS } = require('../config/constants');

const { Schema } = mongoose;

// Free-text delivery address captured at onboarding. A structured
// Building/Wing/Flat directory (the ObjectId refs below) comes in a later
// phase; until then the vendor delivers off these plain fields.
const addressSchema = new Schema(
  {
    building: { type: String, trim: true, default: null },
    wing: { type: String, trim: true, default: null },
    flat: { type: String, trim: true, default: null },
    landmark: { type: String, trim: true, default: null },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    role: { type: String, enum: Object.values(ROLES), default: ROLES.CUSTOMER },
    name: { type: String, trim: true, default: null },
    // Customers sign in with Google (email + googleId); staff (admin panel) sign
    // in by email + password. email/phone/googleId are unique+sparse so records
    // missing any one of them don't trip the unique index.
    // unique already builds an index — adding index: true too triggers
    // Mongoose's "Duplicate schema index" warning at connect time.
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true, default: null },
    googleId: { type: String, unique: true, sparse: true, default: null },
    // Delivery contact number, collected during profile setup (Google gives us
    // an email, not a phone). Unique+sparse so two accounts can't share one.
    phone: { type: String, unique: true, sparse: true, trim: true, default: null },
    avatar: { type: String, default: null },
    passwordHash: { type: String, default: null },

    // Assigned in the Buildings/Wings/Flats phase; left optional until that
    // phase exists so profile setup here only requires a name.
    building: { type: Schema.Types.ObjectId, ref: 'Building', default: null },
    wing: { type: Schema.Types.ObjectId, ref: 'Wing', default: null },
    flat: { type: Schema.Types.ObjectId, ref: 'Flat', default: null },

    // Plain-text delivery address used for orders today.
    address: { type: addressSchema, default: () => ({}) },

    status: { type: String, enum: Object.values(USER_STATUS), default: USER_STATUS.ACTIVE },
    fcmToken: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.methods.hasDeliverableAddress = function hasDeliverableAddress() {
  return Boolean(this.address?.building && this.address?.flat);
};

userSchema.methods.setPassword = async function setPassword(plain) {
  this.passwordHash = await bcrypt.hash(plain, 10);
};

userSchema.methods.comparePassword = function comparePassword(plain) {
  if (!this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    role: this.role,
    name: this.name,
    phone: this.phone,
    email: this.email,
    avatar: this.avatar,
    building: this.building,
    wing: this.wing,
    flat: this.flat,
    address: {
      building: this.address?.building || null,
      wing: this.address?.wing || null,
      flat: this.address?.flat || null,
      landmark: this.address?.landmark || null,
    },
    status: this.status,
    // Profile is complete only once we can actually deliver to the customer:
    // a name, a contact phone, plus a building + flat.
    isProfileComplete: Boolean(this.name) && Boolean(this.phone) && this.hasDeliverableAddress(),
  };
};

module.exports = mongoose.model('User', userSchema);
