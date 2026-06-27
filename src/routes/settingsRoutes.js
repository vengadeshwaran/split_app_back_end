const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

router.get('/currency',   verifyToken, settingsController.getCurrency.bind(settingsController));
router.patch('/currency', verifyToken, settingsController.updateCurrency.bind(settingsController));

module.exports = router;
