const { Router } = require('express');
const validate = require('../../../middlewares/validate');
const controller = require('../../../controllers/admin/legalContent.controller');
const { updateLegalContentSchema } = require('../../../validators/admin/legalContent.validators');

const router = Router();

router.get('/', controller.listAll);
router.get('/:type', controller.getOne);
router.put('/:type', validate(updateLegalContentSchema), controller.updateOne);

module.exports = router;
