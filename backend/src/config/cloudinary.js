const { v2: cloudinary } = require('cloudinary');
const env = require('./env');

// Configure the SDK only when credentials are present; the upload controller
// guards against use when they aren't.
if (env.cloudinary.isConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

module.exports = cloudinary;
