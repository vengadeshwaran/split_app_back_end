const friendService = require('../services/friendService');

const getFriends = async (req, res) => {
  try {
    const friends = await friendService.getFriends(req.user.userId);
    res.json(friends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch friends' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await friendService.getAllUsers(req.user.userId);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch users' });
  }
};

const addFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    if (!friendId) {
      return res.status(400).json({ error: 'friendId is required' });
    }
    const friend = await friendService.addFriend(req.user.userId, Number(friendId));
    res.status(201).json({ message: 'Friend added successfully', friend });
  } catch (error) {
    console.error(error);
    const clientErrors = ['Cannot add yourself as a friend', 'Already friends', 'User not found'];
    if (clientErrors.includes(error.message)) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Unable to add friend' });
  }
};

const removeFriend = async (req, res) => {
  try {
    await friendService.removeFriend(req.user.userId, Number(req.params.friendId));
    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error(error);
    if (error.message === 'Friend not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Unable to remove friend' });
  }
};

module.exports = { getFriends, getAllUsers, addFriend, removeFriend };
