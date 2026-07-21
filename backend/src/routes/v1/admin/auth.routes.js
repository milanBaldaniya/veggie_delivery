const { Router } = require('express');
const validate = require('../../../middlewares/validate');
const verifyJWT = require('../../../middlewares/auth');
const requireRole = require('../../../middlewares/role');
const authController = require('../../../controllers/admin/auth.controller');
const { loginSchema } = require('../../../validators/admin/auth.validators');
const { PANEL_ROLES } = require('../../../config/constants');

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', verifyJWT, requireRole(...PANEL_ROLES), authController.me);

module.exports = router;
