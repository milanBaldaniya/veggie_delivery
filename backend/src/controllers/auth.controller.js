const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const User = require('../models/User');
const otpService = require('../services/otpService');
const tokenService = require('../services/tokenService');
const { USER_STATUS } = require('../config/constants');

const sendOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  let user = await User.findOne({ phone });
  if (!user) {
    user = new User({ phone });
  }
  if (user.status !== USER_STATUS.ACTIVE) {
    throw ApiError.forbidden('This account has been disabled');
  }

  await otpService.sendOtp(user);

  sendSuccess(res, { message: 'OTP sent successfully' });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;

  const user = await User.findOne({ phone });
  if (!user) {
    throw ApiError.badRequest('No OTP was requested for this number');
  }

  await otpService.verifyOtp(user, otp);

  const { token, refreshToken } = tokenService.issueTokenPair(user);

  sendSuccess(res, {
    message: 'Phone verified successfully',
    data: { token, refreshToken, user: user.toPublicJSON() },
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: incomingRefreshToken } = req.body;

  let payload;
  try {
    payload = tokenService.verifyRefreshToken(incomingRefreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(payload.sub);
  if (!user || user.status !== USER_STATUS.ACTIVE) {
    throw ApiError.unauthorized('Account not found or disabled');
  }

  const tokens = tokenService.issueTokenPair(user);

  sendSuccess(res, { message: 'Token refreshed', data: tokens });
});

const me = asyncHandler(async (req, res) => {
  sendSuccess(res, { data: { user: req.user.toPublicJSON() } });
});

module.exports = { sendOtp, verifyOtp, refreshToken, me };
