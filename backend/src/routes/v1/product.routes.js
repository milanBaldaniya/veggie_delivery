const { Router } = require('express');
const verifyJWT = require('../../middlewares/auth');
const productController = require('../../controllers/product.controller');

const router = Router();

router.use(verifyJWT);
router.get('/', productController.listProducts);

module.exports = router;
