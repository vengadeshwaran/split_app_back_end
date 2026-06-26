const { User, UserFriend } = require('../models');
const bcrypt = require('bcrypt');

class UserRepository {
  async findAll() {
    return User.findAll({
      attributes: ['id', 'name', 'email', 'color_code', 'created_at'],
      order: [['id', 'ASC']],
    });
  }

  async findById(id) {
    return User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'color_code', 'created_at'],
    });
  }

  async findWithFriends(userId) {
    return User.findByPk(userId, {
      attributes: ['id', 'name'],
      include: [
        {
          model: User,
          as: 'friends',
          attributes: ['id', 'name'],
          through: { attributes: [] },
          order: [['id', 'ASC']],
        },
      ],
    });
  }

  async friendshipExists(userId, friendId) {
    const count = await UserFriend.count({
      where: { user_id: userId, friend_id: friendId },
    });
    return count > 0;
  }

  async addFriend(userId, friendId) {
    return UserFriend.create({ user_id: userId, friend_id: friendId });
  }

  async removeFriend(userId, friendId) {
    const deleted = await UserFriend.destroy({
      where: { user_id: userId, friend_id: friendId },
    });
    return deleted > 0;
  }

  async getProfile(userId) {
    return User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'color_code', 'preferred_currency', 'created_at'],
    });
  }

  async getPasswordHash(userId) {
    const user = await User.findByPk(userId, { attributes: ['id', 'password'] });
    return user?.password || null;
  }

  async updatePassword(userId, newHashedPassword) {
    await User.update({ password: newHashedPassword }, { where: { id: userId } });
  }

  async updateProfile(userId, { name, colorCode, currency }) {
    const fields = {};
    if (name      !== undefined) fields.name               = name.trim();
    if (colorCode !== undefined) fields.color_code         = colorCode;
    if (currency  !== undefined) fields.preferred_currency = currency;
    if (Object.keys(fields).length === 0) throw new Error('Nothing to update');

    await User.update(fields, { where: { id: userId } });
    return User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'color_code', 'preferred_currency', 'created_at'],
    });
  }
}

module.exports = new UserRepository();
