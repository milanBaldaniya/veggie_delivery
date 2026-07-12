const logger = require('../../utils/logger');

// Dev/local stand-in for a real SMS gateway: just logs the OTP.
async function sendOtp(phone, code) {
  logger.info(`[consoleProvider] OTP for ${phone}: ${code}`);
}

module.exports = { sendOtp };
