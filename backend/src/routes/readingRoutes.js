const express = require('express');
const router = express.Router();
const c = require('../controllers/readingController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', c.listReadings);
router.post('/', c.createReading);
router.put('/:id', c.updateReading);
router.delete('/:id', c.deleteReading);

module.exports = router;