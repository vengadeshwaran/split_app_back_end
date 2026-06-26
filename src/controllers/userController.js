const userService = require('../services/userService');

class UserController {
  async getAll(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async getFriends(req, res, next) {
    try {
      const data = await userService.getUserFriends(req.params.id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async addFriend(req, res, next) {
    try {
      const friend = await userService.addFriend(req.params.id, req.body.friendId);
      res.status(201).json({ message: 'Friend added successfully', friend });
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await userService.getProfile(req.user.userId);
      res.json(user);
    } catch (err) { next(err); }
  }

  async updateProfile(req, res, next) {
    try {
      const { name, colorCode, currency } = req.body;
      const updated = await userService.updateProfile(req.user.userId, { name, colorCode, currency });
      res.json(updated);
    } catch (err) { next(err); }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await userService.changePassword(req.user.userId, { currentPassword, newPassword });
      res.json(result);
    } catch (err) { next(err); }
  }

  async removeFriend(req, res, next) {
    try {
      await userService.removeFriend(req.params.id, req.params.friendId);
      res.json({ message: 'Friend removed successfully' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
