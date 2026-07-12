const ApiError = require('../utils/ApiError');
const tokenService = require('../services/tokenService');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { USER_STATUS } = require('../config/constants');

const verifyJWT = asyncHandler(async function verifyJWT(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  let payload;
  try {
    payload = tokenService.verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  // A malformed sub claim throws a Mongoose CastError, not "not found" —
  // treat both the same way so a bad/tampered token always reads as 401.
  let user;
  try {
    user = await User.findById(payload.sub);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }
  if (!user || user.status !== USER_STATUS.ACTIVE) {
    throw ApiError.unauthorized('Account not found or disabled');
  }

  req.user = user;
  next();
});

module.exports = verifyJWT;
