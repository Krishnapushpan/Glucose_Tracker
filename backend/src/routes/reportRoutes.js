const express = require('express');
const router = express.Router();
const c = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/daily', c.daily);
router.get('/month-to-date', c.monthToDate);
router.get('/monthly', c.monthly);

module.exports = router;