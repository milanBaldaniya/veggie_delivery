const { Router } = require('express');
const controller = require('../../../controllers/admin/appDownload.controller');

const router = Router();

router.get('/qr', controller.getDownloadQr);

module.exports = router;
