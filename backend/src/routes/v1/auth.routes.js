const { Router } = require('express');
const validate = require('../../middlewares/validate');
const verifyJWT = require('../../middlewares/auth');
const authController = require('../../controllers/auth.controller');
const {
  sendOtpSchema,
  verifyOtpSchema,
  refreshTokenSchema,
} = require('../../validators/auth.validators');

const router = Router();

router.post('/send-otp', validate(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.get('/me', verifyJWT, authController.me);

module.exports = router;
