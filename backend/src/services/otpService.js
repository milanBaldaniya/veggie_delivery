const bcrypt = require('bcryptjs');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const smsProvider = require('./smsProvider');

function generateCode() {
  const max = 10 ** env.otp.length;
  const code = Math.floor(Math.random() * max);
  return code.toString().padStart(env.otp.length, '0');
}

async function sendOtp(user) {
  const now = Date.now();
  const cooldownMs = env.otp.resendCooldownSeconds * 1000;
  if (user.otp?.lastSentAt && now - user.otp.lastSentAt.getTime() < cooldownMs) {
    const waitSeconds = Math.ceil((cooldownMs - (now - user.otp.lastSentAt.getTime())) / 1000);
    throw ApiError.badRequest(`Please wait ${waitSeconds}s before requesting another OTP`);
  }

  const code = generateCode();
  user.otp = {
    codeHash: await bcrypt.hash(code, 10),
    expiresAt: new Date(now + env.otp.expiresInMinutes * 60 * 1000),
    attempts: 0,
    lastSentAt: new Date(now),
  };
  await user.save();

  await smsProvider.sendOtp(user.phone, code);
}

async function verifyOtp(user, code) {
  if (!user.otp?.codeHash || !user.otp?.expiresAt) {
    throw ApiError.badRequest('No OTP was requested for this number');
  }
  if (user.otp.expiresAt.getTime() < Date.now()) {
    throw ApiError.badRequest('OTP has expired, please request a new one');
  }
  if (user.otp.attempts >= env.otp.maxAttempts) {
    throw ApiError.badRequest('Too many incorrect attempts, please request a new OTP');
  }

  const isMatch = await bcrypt.compare(code, user.otp.codeHash);
  if (!isMatch) {
    user.otp.attempts += 1;
    await user.save();
    throw ApiError.badRequest('Incorrect OTP');
  }

  user.isPhoneVerified = true;
  user.otp = { codeHash: null, expiresAt: null, attempts: 0, lastSentAt: null };
  await user.save();
}

module.exports = { sendOtp, verifyOtp };
