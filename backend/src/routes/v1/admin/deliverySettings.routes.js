const { Router } = require('express');
const validate = require('../../../middlewares/validate');
const controller = require('../../../controllers/admin/deliverySettings.controller');
const { updateDeliverySettingsSchema } = require('../../../validators/admin/deliverySettings.validators');

const router = Router();

router.get('/', controller.getDeliverySettings);
router.put('/', validate(updateDeliverySettingsSchema), controller.updateDeliverySettings);

module.exports = router;
