const env = require('../../config/env');
const consoleProvider = require('./consoleProvider');

// Every provider implements: async sendOtp(phone, code) -> void.
// Swap in a real provider (Twilio, MSG91, ...) here without touching callers.
const providers = {
  console: consoleProvider,
};

function getSmsProvider() {
  return providers[env.smsProvider] || consoleProvider;
}

module.exports = getSmsProvider();
