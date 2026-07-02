const express    = require('express');
const router     = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

router.get('/overview', verifyToken, verifyAdmin, adminController.getOverview);

module.exports = router;
