const ApiError = require('../utils/ApiError');

function requireRole(...roles) {
  return function requireRoleMiddleware(req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have access to this resource'));
    }
    next();
  };
}

module.exports = requireRole;
