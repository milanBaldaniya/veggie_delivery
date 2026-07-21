const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const User = require('../models/User');
const googleService = require('../services/googleService');
const tokenService = require('../services/tokenService');
const { USER_STATUS, ROLES } = require('../config/constants');

const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  // Verifies the token's signature, expiry, and audience against our client IDs.
  const profile = await googleService.verifyIdToken(idToken);

  // Match an existing account by Google id first, then fall back to email so a
  // customer who previously signed in another way is linked, not duplicated.
  let user = await User.findOne({
    $or: [{ googleId: profile.googleId }, { email: profile.email }],
  });

  if (!user) {
    user = new User({
      role: ROLES.CUSTOMER,
      googleId: profile.googleId,
      email: profile.email,
      name: profile.name,
      avatar: profile.picture,
    });
  } else {
    // Backfill Google fields on an account first seen via another channel.
    if (!user.googleId) user.googleId = profile.googleId;
    if (!user.name && profile.name) user.name = profile.name;
    if (!user.avatar && profile.picture) user.avatar = profile.picture;
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw ApiError.forbidden('This account has been disabled');
  }

  await user.save();

  const { token, refreshToken } = tokenService.issueTokenPair(user);

  sendSuccess(res, {
    message: 'Signed in successfully',
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

module.exports = { googleLogin, refreshToken, me };
