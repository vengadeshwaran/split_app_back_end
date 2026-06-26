const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/profile',          verifyToken, userController.getProfile.bind(userController));
router.patch('/profile',        verifyToken, userController.updateProfile.bind(userController));
router.patch('/change-password', verifyToken, userController.changePassword.bind(userController));
router.get('/', userController.getAll.bind(userController));
router.get('/:id', userController.getById.bind(userController));
router.get('/:id/friends', userController.getFriends.bind(userController));
router.post('/:id/friends', userController.addFriend.bind(userController));
router.delete('/:id/friends/:friendId', userController.removeFriend.bind(userController));

module.exports = router;
