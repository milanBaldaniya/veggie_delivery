const { Router } = require('express');
const verifyJWT = require('../../middlewares/auth');
const billController = require('../../controllers/bill.controller');

const router = Router();

router.use(verifyJWT);
router.get('/', billController.listMyBills);
router.get('/:id', billController.getMyBill);

module.exports = router;
