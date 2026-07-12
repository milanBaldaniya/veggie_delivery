const { Router } = require('express');
const { sendSuccess } = require('../../utils/ApiResponse');

const router = Router();

router.get('/health', (req, res) => {
  sendSuccess(res, { message: 'API is healthy', data: { uptime: process.uptime() } });
});

router.use('/auth', require('./auth.routes'));
router.use('/customers', require('./customer.routes'));

// Further feature routers are mounted here phase by phase.

module.exports = router;
