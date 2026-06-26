const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/latest',          verifyToken, transactionController.getLatest);
router.get('/audit',           verifyToken, transactionController.getAuditLog);
router.get('/recent-friends',  verifyToken, transactionController.getRecentFriends);
router.get('/with/:friendId',  verifyToken, transactionController.getWithFriend);
router.post('/',               verifyToken, transactionController.create);
router.patch('/:id/complete',  verifyToken, transactionController.markComplete);

module.exports = router;
