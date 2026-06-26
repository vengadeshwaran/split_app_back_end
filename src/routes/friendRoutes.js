const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, friendController.getFriends);
router.get('/users', verifyToken, friendController.getAllUsers);
router.post('/', verifyToken, friendController.addFriend);
router.delete('/:friendId', verifyToken, friendController.removeFriend);

module.exports = router;
