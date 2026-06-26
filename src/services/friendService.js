const db = require('../config/db');

const getFriends = async (userId) => {
  const result = await db.query(
    `SELECT u.id, u.name, u.email, u.color_code
     FROM user_friends uf
     JOIN users u ON u.id = uf.friend_id
     WHERE uf.user_id = $1
     ORDER BY u.name`,
    [userId]
  );
  return result.rows;
};

const getAllUsers = async (userId) => {
  const result = await db.query(
    `SELECT u.id, u.name, u.email, u.color_code,
            CASE WHEN uf.id IS NOT NULL THEN true ELSE false END AS is_friend
     FROM users u
     LEFT JOIN user_friends uf ON uf.friend_id = u.id AND uf.user_id = $1
     WHERE u.id != $1
     ORDER BY u.name`,
    [userId]
  );
  return result.rows;
};

const addFriend = async (userId, friendId) => {
  if (userId === friendId) throw new Error('Cannot add yourself as a friend');

  const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [friendId]);
  if (userCheck.rows.length === 0) throw new Error('User not found');

  const existing = await db.query(
    'SELECT id FROM user_friends WHERE user_id = $1 AND friend_id = $2',
    [userId, friendId]
  );
  if (existing.rows.length > 0) throw new Error('Already friends');

  await db.query(
    'INSERT INTO user_friends(user_id, friend_id) VALUES($1, $2), ($2, $1)',
    [userId, friendId]
  );

  const result = await db.query(
    'SELECT id, name, email, color_code FROM users WHERE id = $1',
    [friendId]
  );
  return result.rows[0];
};

const removeFriend = async (userId, friendId) => {
  const result = await db.query(
    `DELETE FROM user_friends
     WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
     RETURNING id`,
    [userId, friendId]
  );
  if (result.rows.length === 0) throw new Error('Friend not found');
};

module.exports = { getFriends, getAllUsers, addFriend, removeFriend };
