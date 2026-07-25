const { Router } = require('express');
const verifyJWT = require('../../middlewares/auth');
const buildingController = require('../../controllers/building.controller');

const router = Router();

router.use(verifyJWT);
router.get('/', buildingController.listBuildings);

module.exports = router;
