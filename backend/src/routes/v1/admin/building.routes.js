const { Router } = require('express');
const validate = require('../../../middlewares/validate');
const c = require('../../../controllers/admin/building.controller');
const {
  createBuildingSchema,
  updateBuildingSchema,
  assignWatchmanSchema,
} = require('../../../validators/admin/people.validators');

const router = Router();

router.get('/', c.listBuildings);
router.post('/', validate(createBuildingSchema), c.createBuilding);
router.get('/:id/stats', c.buildingStats);
router.put('/:id', validate(updateBuildingSchema), c.updateBuilding);
router.patch('/:id/watchman', validate(assignWatchmanSchema), c.assignWatchman);
router.delete('/:id', c.deleteBuilding);

module.exports = router;
