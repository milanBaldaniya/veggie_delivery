const { Router } = require('express');
const validate = require('../../../middlewares/validate');
const c = require('../../../controllers/admin/billing.controller');
const {
  generateBillsSchema,
  paymentSchema,
  markPaidSchema,
} = require('../../../validators/admin/finance.validators');

const router = Router();

router.get('/', c.listBills);
router.post('/generate', validate(generateBillsSchema), c.generateBills);
router.get('/:id', c.getBill);
router.patch('/:id/mark-paid', validate(markPaidSchema), c.markAsPaid);
router.patch('/:id/pay', validate(paymentSchema), c.recordPayment);

module.exports = router;
