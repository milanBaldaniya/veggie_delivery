const { Router } = require('express');
const validate = require('../../../middlewares/validate');
const controller = require('../../../controllers/admin/product.controller');
const {
  createProductSchema,
  updateProductSchema,
  toggleSchema,
} = require('../../../validators/admin/product.validators');

// Mounted behind verifyJWT + requireRole in admin/index.js.
const router = Router();

router.get('/', controller.listProducts);
router.post('/', validate(createProductSchema), controller.createProduct);
router.put('/:id', validate(updateProductSchema), controller.updateProduct);
router.patch('/:id/toggle', validate(toggleSchema), controller.toggleProduct);
router.delete('/:id', controller.deleteProduct);

module.exports = router;
