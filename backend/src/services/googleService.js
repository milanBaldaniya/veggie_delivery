const { OAuth2Client } = require('google-auth-library');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const client = new OAuth2Client();

/**
 * Verifies a Google-issued ID token and returns the trusted profile claims.
 * Throws a 401 ApiError if the token is invalid, expired, or was issued for a
 * client ID we don't accept.
 */
async function verifyIdToken(idToken) {
  if (!env.google.clientIds.length) {
    throw new ApiError(500, 'Google Sign-In is not configured on the server');
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.google.clientIds,
    });
    payload = ticket.getPayload();
  } catch {
    throw ApiError.unauthorized('Invalid Google sign-in token');
  }

  if (!payload?.email || !payload.email_verified) {
    throw ApiError.unauthorized('Google account email is not verified');
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name || null,
    picture: payload.picture || null,
  };
}

module.exports = { verifyIdToken };
