const { Router } = require('express');
const validate = require('../../../middlewares/validate');
const c = require('../../../controllers/admin/user.controller');
const { setStatusSchema } = require('../../../validators/admin/people.validators');

const router = Router();

router.get('/', c.listUsers);
router.get('/:id', c.getUser);
router.patch('/:id/status', validate(setStatusSchema), c.setStatus);
router.delete('/:id', c.deleteUser);

module.exports = router;
