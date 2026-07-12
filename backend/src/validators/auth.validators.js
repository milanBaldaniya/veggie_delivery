const yup = require('yup');

const phoneSchema = yup
  .string()
  .trim()
  .matches(/^\+?[0-9]{7,15}$/, 'Enter a valid phone number')
  .required('Phone is required');

const sendOtpSchema = yup.object({
  phone: phoneSchema,
});

const verifyOtpSchema = yup.object({
  phone: phoneSchema,
  otp: yup
    .string()
    .trim()
    .matches(/^[0-9]+$/, 'OTP must be numeric')
    .required('OTP is required'),
});

const refreshTokenSchema = yup.object({
  refreshToken: yup.string().required('Refresh token is required'),
});

module.exports = { sendOtpSchema, verifyOtpSchema, refreshTokenSchema };
