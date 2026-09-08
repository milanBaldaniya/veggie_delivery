const { Router } = require('express');
const legalController = require('../../controllers/legal.controller');

const router = Router();

// Intentionally public — no verifyJWT — so Terms/Privacy/About/Refund
// content is readable before the customer logs in.
router.get('/:type', legalController.getLegalContent);

module.exports = router;
