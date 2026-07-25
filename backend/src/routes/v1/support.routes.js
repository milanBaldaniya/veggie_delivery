const { Router } = require('express');
const verifyJWT = require('../../middlewares/auth');
const supportController = require('../../controllers/support.controller');

const router = Router();

router.use(verifyJWT);
router.get('/', supportController.getSupport);

module.exports = router;
