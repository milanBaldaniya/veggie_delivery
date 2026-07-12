const ApiError = require('../utils/ApiError');

/**
 * Validates req[source] against a Yup schema, replacing it with the cast value on success.
 */
function validate(schema, source = 'body') {
  return async function validateMiddleware(req, res, next) {
    try {
      const value = await schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true,
      });
      req[source] = value;
      next();
    } catch (err) {
      const errors = err.inner?.length
        ? err.inner.map((e) => e.message)
        : [err.message];
      next(ApiError.badRequest('Validation failed', errors));
    }
  };
}

module.exports = validate;
