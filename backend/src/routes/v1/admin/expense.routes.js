const { Router } = require('express');
const validate = require('../../../middlewares/validate');
const c = require('../../../controllers/admin/expense.controller');
const { createExpenseSchema, updateExpenseSchema } = require('../../../validators/admin/finance.validators');

const router = Router();

router.get('/', c.listExpenses);
router.get('/summary', c.expenseSummary);
router.post('/', validate(createExpenseSchema), c.createExpense);
router.put('/:id', validate(updateExpenseSchema), c.updateExpense);
router.delete('/:id', c.deleteExpense);

module.exports = router;
