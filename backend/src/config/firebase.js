const path = require('path');
const admin = require('firebase-admin');
const env = require('./env');

let app = null;

// Initialized lazily so a server without Google Sign-In configured (e.g. a
// local dev box that never exercises that flow) doesn't crash on boot.
function getFirebaseApp() {
  if (app) return app;

  if (!env.firebase.isConfigured) {
    throw new Error(
      'Firebase is not configured on the server. Set FIREBASE_SERVICE_ACCOUNT_PATH.'
    );
  }

  const serviceAccount = require(path.resolve(env.firebase.serviceAccountPath));
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  return app;
}

module.exports = { getFirebaseApp };
