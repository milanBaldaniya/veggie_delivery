const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.isApiError ? err.statusCode : 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors;

  if (err.name === 'ValidationError' && err.errors && !err.isApiError) {
    // Mongoose validation error
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => e.message);
    message = 'Validation failed';
  } else if (err.code === 11000) {
    // Mongo duplicate key
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already exists` : 'Duplicate value';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  } else if (err.name === 'MulterError') {
    // File upload errors (e.g. file too large).
    statusCode = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Image is too large (max 5MB)' : err.message;
  }

  if (statusCode === 500) {
    logger.error(err.stack || err.message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
}

module.exports = { notFoundHandler, errorHandler };
