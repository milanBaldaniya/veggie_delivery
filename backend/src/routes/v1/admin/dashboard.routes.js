const { Router } = require('express');
const controller = require('../../../controllers/admin/dashboard.controller');

const router = Router();

router.get('/', controller.getStats);

module.exports = router;
