const { Router } = require('express');
const validate = require('../../../middlewares/validate');
const c = require('../../../controllers/admin/watchman.controller');
const {
  createWatchmanSchema,
  updateWatchmanSchema,
} = require('../../../validators/admin/people.validators');

const router = Router();

router.get('/', c.listWatchmen);
router.post('/', validate(createWatchmanSchema), c.createWatchman);
router.put('/:id', validate(updateWatchmanSchema), c.updateWatchman);
router.delete('/:id', c.deleteWatchman);

module.exports = router;
