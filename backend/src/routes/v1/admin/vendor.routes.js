const { Router } = require('express');
const validate = require('../../../middlewares/validate');
const c = require('../../../controllers/admin/vendor.controller');
const { createVendorSchema, updateVendorSchema } = require('../../../validators/admin/finance.validators');

const router = Router();

router.get('/', c.listVendors);
router.post('/', validate(createVendorSchema), c.createVendor);
router.get('/:id/purchases', c.vendorPurchases);
router.put('/:id', validate(updateVendorSchema), c.updateVendor);
router.delete('/:id', c.deleteVendor);

module.exports = router;
