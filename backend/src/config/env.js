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

  mongoUri: process.env.MONGO_URI,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  order: {
    // Customers can only place orders before this hour (24h clock) in the
    // configured timezone; after it the order window is closed until the next
    // day. Enforced server-side so a device with a wrong clock can't bypass it.
    cutoffHour: Number(process.env.ORDER_CUTOFF_HOUR) || 12,
    timezone: process.env.ORDER_TIMEZONE || 'Asia/Kolkata',
  },

  billing: {
    // Cron for the weekly bill finalization job. Default: Monday 00:05 (in the
    // order timezone), closing out the week that just ended.
    weeklyCron: process.env.WEEKLY_BILLING_CRON || '5 0 * * 1',
  },

  google: {
    // Every OAuth client that can produce an ID token we must accept as an
    // audience: the Web client (used by the backend to verify and by the
    // Android app's `webClientId`), plus the iOS client. Comma-separated.
    clientIds: (process.env.GOOGLE_CLIENT_IDS || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
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
