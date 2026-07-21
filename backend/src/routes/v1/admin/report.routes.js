const { Router } = require('express');
const controller = require('../../../controllers/admin/report.controller');

const router = Router();

router.get('/daily-purchase', controller.dailyPurchase);
router.get('/sales', controller.salesReport);
router.get('/building-wise', controller.buildingWiseSales);
router.get('/product-consumption', controller.productConsumption);
router.get('/profit-loss', controller.profitAndLoss);

module.exports = router;
