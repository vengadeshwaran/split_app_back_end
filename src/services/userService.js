const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');

const parseId = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

class UserService {
  async getAllUsers() {
    return userRepository.findAll();
  }

  async getUserById(id) {
    const userId = parseId(id);
    if (!userId) throw new AppError('Invalid user ID', 400);

    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async getUserFriends(id) {
    const userId = parseId(id);
    if (!userId) throw new AppError('Invalid user ID', 400);

    const user = await userRepository.findWithFriends(userId);
    if (!user) throw new AppError('User not found', 404);

    return {
      user: { id: user.id, name: user.name },
      friends: user.friends,
    };
  }

  async addFriend(id, friendId) {
    const userId = parseId(id);
    if (!userId) throw new AppError('Invalid user ID', 400);

    if (friendId === undefined || friendId === null) {
      throw new AppError('friendId is required', 400);
    }
    const parsedFriendId = parseId(friendId);
    if (!parsedFriendId) throw new AppError('Invalid friendId', 400);

    if (userId === parsedFriendId) {
      throw new AppError('Cannot add yourself as a friend', 400);
    }

    const [user, friend] = await Promise.all([
      userRepository.findById(userId),
      userRepository.findById(parsedFriendId),
    ]);

    if (!user) throw new AppError('User not found', 404);
    if (!friend) throw new AppError('Friend user not found', 404);

    const alreadyFriends = await userRepository.friendshipExists(userId, parsedFriendId);
    if (alreadyFriends) throw new AppError('Already friends', 409);

    await userRepository.addFriend(userId, parsedFriendId);
    return { id: friend.id, name: friend.name };
  }

  async getProfile(id) {
    const userId = parseId(id);
    if (!userId) throw new AppError('Invalid user ID', 400);
    const user = await userRepository.getProfile(userId);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async changePassword(id, { currentPassword, newPassword }) {
    const userId = parseId(id);
    if (!userId) throw new AppError('Invalid user ID', 400);
    if (!currentPassword || !newPassword) throw new AppError('Both current and new password are required', 400);
    if (newPassword.length < 6) throw new AppError('New password must be at least 6 characters', 400);
    if (currentPassword === newPassword) throw new AppError('New password must be different from current password', 400);

    const hash = await userRepository.getPasswordHash(userId);
    if (!hash) throw new AppError('User not found', 404);

    const bcrypt = require('bcrypt');
    const isValid = await bcrypt.compare(currentPassword, hash);
    if (!isValid) throw new AppError('Current password is incorrect', 401);

    const newHash = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePassword(userId, newHash);
    return { message: 'Password updated successfully' };
  }

  async updateProfile(id, { name, colorCode, currency }) {
    const userId = parseId(id);
    if (!userId) throw new AppError('Invalid user ID', 400);
    if (name !== undefined && !name?.trim()) throw new AppError('Name cannot be empty', 400);
    return userRepository.updateProfile(userId, { name, colorCode, currency });
  }

  async removeFriend(id, friendId) {
    const userId = parseId(id);
    if (!userId) throw new AppError('Invalid user ID', 400);

    const parsedFriendId = parseId(friendId);
    if (!parsedFriendId) throw new AppError('Invalid friendId', 400);

    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const exists = await userRepository.friendshipExists(userId, parsedFriendId);
    if (!exists) throw new AppError('Friend not found', 404);

    await userRepository.removeFriend(userId, parsedFriendId);
  }
}

module.exports = new UserService();
