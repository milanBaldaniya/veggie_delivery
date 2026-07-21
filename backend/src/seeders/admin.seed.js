/**
 * Seeds / resets the default Super Admin account for the web panel.
 * Idempotent: upserts by email. Credentials are overridable via env.
 *
 *   node src/seeders/admin.seed.js
 *
 * Default login:  admin@veggie.local  /  Admin@123
 */
require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const logger = require('../utils/logger');
const { ROLES, USER_STATUS } = require('../config/constants');

const EMAIL = (process.env.SEED_ADMIN_EMAIL || 'admin@veggie.local').toLowerCase();
const PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
const NAME = process.env.SEED_ADMIN_NAME || 'Super Admin';

async function run() {
  await mongoose.connect(env.mongoUri);
  logger.info('MongoDB connected (admin seeder)');

  let user = await User.findOne({ email: EMAIL });
  if (!user) {
    user = new User({ email: EMAIL, name: NAME, role: ROLES.SUPER_ADMIN, status: USER_STATUS.ACTIVE });
  } else {
    user.role = ROLES.SUPER_ADMIN;
    user.status = USER_STATUS.ACTIVE;
  }
  await user.setPassword(PASSWORD);
  await user.save();

  logger.info(`Super Admin ready → email: ${EMAIL}  password: ${PASSWORD}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  logger.error(err.message);
  process.exit(1);
});
