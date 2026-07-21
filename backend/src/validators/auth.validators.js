const yup = require('yup');

const googleLoginSchema = yup.object({
  idToken: yup.string().trim().required('Google ID token is required'),
});

const refreshTokenSchema = yup.object({
  refreshToken: yup.string().required('Refresh token is required'),
});

module.exports = { googleLoginSchema, refreshTokenSchema };
