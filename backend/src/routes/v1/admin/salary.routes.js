const { Router } = require('express');
const validate = require('../../../middlewares/validate');
const c = require('../../../controllers/admin/salary.controller');
const {
  createSalarySchema,
  updateSalarySchema,
  paymentSchema,
} = require('../../../validators/admin/finance.validators');

const router = Router();

router.get('/', c.listSalaries);
router.get('/staff', c.eligibleStaff);
router.post('/', validate(createSalarySchema), c.createSalary);
router.put('/:id', validate(updateSalarySchema), c.updateSalary);
router.patch('/:id/pay', validate(paymentSchema), c.paySalary);
router.delete('/:id', c.deleteSalary);

module.exports = router;
