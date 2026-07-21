const { Router } = require('express');
const verifyJWT = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const orderController = require('../../controllers/order.controller');
const { createOrderSchema } = require('../../validators/order.validators');

const router = Router();

router.use(verifyJWT);
router.get('/window', orderController.getOrderWindow);
router.post('/', validate(createOrderSchema), orderController.createOrder);
router.get('/', orderController.listMyOrders);

module.exports = router;
