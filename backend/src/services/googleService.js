const { getFirebaseApp } = require('../config/firebase');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * Verifies a Firebase ID token (issued after the mobile app signs the user in
 * to Firebase with their Google credential) and returns the trusted profile
 * claims. Throws a 401 ApiError if the token is invalid or expired.
 */
async function verifyIdToken(idToken) {
  if (!env.firebase.isConfigured) {
    throw new ApiError(500, 'Google Sign-In is not configured on the server');
  }

  let decoded;
  try {
    decoded = await getFirebaseApp().auth().verifyIdToken(idToken);
  } catch {
    throw ApiError.unauthorized('Invalid Google sign-in token');
  }

  if (!decoded.email || !decoded.email_verified) {
    throw ApiError.unauthorized('Google account email is not verified');
  }

  return {
    firebaseUid: decoded.uid,
    email: decoded.email,
    name: decoded.name || null,
    picture: decoded.picture || null,
  };
}

module.exports = { verifyIdToken };
