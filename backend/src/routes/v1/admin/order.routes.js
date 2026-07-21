const { Router } = require('express');
const validate = require('../../../middlewares/validate');
const controller = require('../../../controllers/admin/order.controller');
const { updateStatusSchema } = require('../../../validators/admin/order.validators');

const router = Router();

router.get('/', controller.listOrders);
router.get('/buildings', controller.listOrderBuildings);
router.get('/:id', controller.getOrder);
router.patch('/:id/status', validate(updateStatusSchema), controller.updateStatus);

module.exports = router;
