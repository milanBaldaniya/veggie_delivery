const { Router } = require('express');
const c = require('../../../controllers/admin/packing.controller');

const router = Router();

router.get('/', c.packingList);
router.post('/close-day', c.closeOrdersForDay);

module.exports = router;
