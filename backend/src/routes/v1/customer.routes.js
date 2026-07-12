const { Router } = require('express');
const validate = require('../../middlewares/validate');
const verifyJWT = require('../../middlewares/auth');
const customerController = require('../../controllers/customer.controller');
const { updateMeSchema } = require('../../validators/customer.validators');

const router = Router();

router.use(verifyJWT);
router.get('/me', customerController.getMe);
router.put('/me', validate(updateMeSchema), customerController.updateMe);

module.exports = router;
