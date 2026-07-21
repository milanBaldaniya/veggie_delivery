const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const { sendSuccess } = require('../../utils/ApiResponse');
const User = require('../../models/User');
const tokenService = require('../../services/tokenService');
const { PANEL_ROLES, USER_STATUS } = require('../../config/constants');

// Staff sign-in for the admin panel: email + password, and the account must
// hold a panel role. Kept separate from the customer Google Sign-In flow.
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  const invalid = ApiError.unauthorized('Invalid email or password');

  if (!user || !PANEL_ROLES.includes(user.role)) throw invalid;
  if (user.status !== USER_STATUS.ACTIVE) throw ApiError.forbidden('This account has been disabled');

  const ok = await user.comparePassword(password);
  if (!ok) throw invalid;

  const { token, refreshToken } = tokenService.issueTokenPair(user);
  sendSuccess(res, {
    message: 'Logged in successfully',
    data: { token, refreshToken, user: user.toPublicJSON() },
  });
});

const me = asyncHandler(async (req, res) => {
  sendSuccess(res, { data: { user: req.user.toPublicJSON() } });
});

module.exports = { login, me };
