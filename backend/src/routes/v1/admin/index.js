const { Router } = require('express');
const verifyJWT = require('../../../middlewares/auth');
const requireRole = require('../../../middlewares/role');
const { MANAGEMENT_ROLES } = require('../../../config/constants');

const router = Router();

// Auth is public (login) + self (me handles its own guard).
router.use('/auth', require('./auth.routes'));

// Everything below requires a signed-in management-role staff member.
router.use(verifyJWT, requireRole(...MANAGEMENT_ROLES));

router.use('/dashboard', require('./dashboard.routes'));
router.use('/products', require('./product.routes'));
router.use('/orders', require('./order.routes'));
router.use('/reports', require('./report.routes'));
router.use('/buildings', require('./building.routes'));
router.use('/watchmen', require('./watchman.routes'));
router.use('/users', require('./user.routes'));
router.use('/vendors', require('./vendor.routes'));
router.use('/expenses', require('./expense.routes'));
router.use('/salaries', require('./salary.routes'));
router.use('/bills', require('./billing.routes'));
router.use('/packing', require('./packing.routes'));
router.use('/uploads', require('./upload.routes'));

module.exports = router;
