const User = require('../models/User');
const { ROLES, USER_STATUS } = require('../config/constants');

const EMAIL = (process.env.SEED_ADMIN_EMAIL || 'admin@veggie.local').toLowerCase();
const PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
const NAME = process.env.SEED_ADMIN_NAME || 'Super Admin';

/**
 * Ensures the default Super Admin account exists, creating or refreshing it
 * as needed. Idempotent (upserts by email) so it's safe to call on every
 * server boot — no manual seeding step required in any environment.
 */
async function seedSuperAdmin() {
  let user = await User.findOne({ email: EMAIL });
  if (!user) {
    user = new User({ email: EMAIL, name: NAME, role: ROLES.SUPER_ADMIN, status: USER_STATUS.ACTIVE });
  } else {
    user.role = ROLES.SUPER_ADMIN;
    user.status = USER_STATUS.ACTIVE;
  }
  await user.setPassword(PASSWORD);
  await user.save();

  return { email: EMAIL };
}

module.exports = seedSuperAdmin;
