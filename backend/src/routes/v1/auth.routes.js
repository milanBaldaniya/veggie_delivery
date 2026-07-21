const { Router } = require('express');
const validate = require('../../middlewares/validate');
const verifyJWT = require('../../middlewares/auth');
const authController = require('../../controllers/auth.controller');
const {
  googleLoginSchema,
  refreshTokenSchema,
} = require('../../validators/auth.validators');

const router = Router();

router.post('/google', validate(googleLoginSchema), authController.googleLogin);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.get('/me', verifyJWT, authController.me);

module.exports = router;
