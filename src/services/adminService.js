const db = require('../config/db');

const getOverview = async () => {
  const [usersRes, groupsRes, txRes, recentUsersRes] = await Promise.all([
    db.query(`SELECT COUNT(*)::int AS total FROM users`),
    db.query(`SELECT COUNT(*)::int AS total FROM groups`),
    db.query(`SELECT COUNT(*)::int AS total, COALESCE(SUM(amount), 0)::float AS total_amount FROM transactions`),
    db.query(
      `SELECT id, name, email, is_admin, created_at
       FROM users ORDER BY created_at DESC LIMIT 10`
    ),
  ]);

  return {
    total_users:    usersRes.rows[0].total,
    total_groups:   groupsRes.rows[0].total,
    total_transactions: txRes.rows[0].total,
    total_amount:   txRes.rows[0].total_amount,
    recent_users:   recentUsersRes.rows,
  };
};

module.exports = { getOverview };
