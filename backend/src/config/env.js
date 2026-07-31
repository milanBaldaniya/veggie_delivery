require('dotenv').config();

const required = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  // This server's own public origin (no trailing slash) — used to build
  // absolute links (e.g. the APK download URL embedded in the QR code) since
  // Render sits behind a proxy and req.protocol/host aren't reliable for that.
  publicUrl: (process.env.PUBLIC_URL || `http://localhost:${Number(process.env.PORT) || 5000}`).replace(/\/$/, ''),

  mongoUri: process.env.MONGO_URI,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  order: {
    // Timezone the delivery window / order cutoff (admin-configurable, see
    // DeliverySettings) and weekly billing period are evaluated in.
    timezone: process.env.ORDER_TIMEZONE || 'Asia/Kolkata',
  },

  billing: {
    // Cron for the weekly bill finalization job. Default: Monday 00:05 (in the
    // order timezone), closing out the week that just ended.
    weeklyCron: process.env.WEEKLY_BILLING_CRON || '5 0 * * 1',
  },

  firebase: {
    // Path to the Firebase Admin SDK service account JSON (Firebase Console →
    // Project Settings → Service Accounts → Generate new private key). Used to
    // verify the Firebase ID tokens the mobile app sends after Google sign-in.
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '',
    get isConfigured() {
      return Boolean(this.serviceAccountPath);
    },
  },

  corsOrigin: process.env.CORS_ORIGIN || '*',

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'veggie-delivery/products',
    // Only usable once all three credentials are present.
    get isConfigured() {
      return Boolean(this.cloudName && this.apiKey && this.apiSecret);
    },
  },
};
