const { Router } = require('express');
const validate = require('../../../middlewares/validate');
const controller = require('../../../controllers/admin/supportSettings.controller');
const { updateSupportSettingsSchema } = require('../../../validators/admin/supportSettings.validators');

const router = Router();

router.get('/', controller.getSupportSettings);
router.put('/', validate(updateSupportSettingsSchema), controller.updateSupportSettings);

module.exports = router;
