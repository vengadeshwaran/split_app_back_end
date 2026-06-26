const db = require('../config/db');

const getLatest = async (userId, limit = 10) => {
  const result = await db.query(
    `SELECT
       t.id,
       t.type,
       t.description,
       t.amount,
       t.currency,
       t.created_at,
       t.from_user_id,
       t.to_user_id,
       uf.id   AS from_id,
       uf.name AS from_name,
       uf.color_code AS from_color,
       ut.id   AS to_id,
       ut.name AS to_name,
       ut.color_code AS to_color
     FROM transactions t
     JOIN users uf ON uf.id = t.from_user_id
     JOIN users ut ON ut.id = t.to_user_id
     WHERE t.from_user_id = $1 OR t.to_user_id = $1
     ORDER BY t.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
};

const getRecentFriends = async (userId) => {
  const result = await db.query(
    `SELECT * FROM (
       SELECT DISTINCT ON (other_user_id)
         other_user_id,
         other_name,
         other_color,
         type,
         description,
         amount,
         currency,
         created_at,
         from_user_id
       FROM (
         SELECT
           CASE WHEN t.from_user_id = $1 THEN t.to_user_id   ELSE t.from_user_id  END AS other_user_id,
           CASE WHEN t.from_user_id = $1 THEN tu.name         ELSE fu.name         END AS other_name,
           CASE WHEN t.from_user_id = $1 THEN tu.color_code   ELSE fu.color_code   END AS other_color,
           t.type::text,
           t.description,
           t.amount::float,
           t.currency,
           t.created_at,
           t.from_user_id
         FROM transactions t
         JOIN users fu ON fu.id = t.from_user_id
         JOIN users tu ON tu.id = t.to_user_id
         WHERE (t.from_user_id = $1 OR t.to_user_id = $1)
           AND t.from_user_id != t.to_user_id
       ) inner_sub
       ORDER BY other_user_id, created_at DESC
     ) outer_sub
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

const createTransaction = async ({ fromUserId, toUserId, type, description, amount, currency = 'AED' }) => {
  const result = await db.query(
    `INSERT INTO transactions (from_user_id, to_user_id, type, description, amount, currency)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [fromUserId, toUserId, type, description, amount, currency]
  );
  return result.rows[0];
};

const markComplete = async (txId, userId) => {
  const check = await db.query(
    'SELECT id FROM transactions WHERE id = $1 AND from_user_id = $2',
    [txId, userId]
  );
  if (check.rows.length === 0) {
    throw new Error('Transaction not found or not authorized');
  }
  const result = await db.query(
    "UPDATE transactions SET status = 'completed' WHERE id = $1 RETURNING *",
    [txId]
  );
  return result.rows[0];
};

const getWithFriend = async (userId, friendId) => {
  const result = await db.query(
    `SELECT
       t.id,
       t.type,
       t.status,
       t.description,
       t.amount,
       t.currency,
       t.created_at,
       t.from_user_id,
       t.to_user_id,
       uf.name AS from_name,
       uf.color_code AS from_color,
       ut.name AS to_name,
       ut.color_code AS to_color
     FROM transactions t
     JOIN users uf ON uf.id = t.from_user_id
     JOIN users ut ON ut.id = t.to_user_id
     WHERE (t.from_user_id = $1 AND t.to_user_id = $2)
        OR (t.from_user_id = $2 AND t.to_user_id = $1)
     ORDER BY t.created_at ASC`,
    [userId, friendId]
  );
  return result.rows;
};

const getAuditLog = async (userId) => {
  const result = await db.query(
    `SELECT
       'tx_' || t.id                                                        AS id,
       'transaction'                                                         AS source,
       t.type::text,
       CASE WHEN t.from_user_id = $1 THEN 'sent' ELSE 'received' END       AS direction,
       t.amount::float                                                       AS amount,
       t.description,
       t.currency,
       t.created_at,
       CASE WHEN t.from_user_id = $1 THEN tu.name  ELSE fu.name  END       AS other_name,
       CASE WHEN t.from_user_id = $1 THEN tu.color_code ELSE fu.color_code END AS other_color,
       NULL                                                                  AS group_name,
       NULL                                                                  AS group_color
     FROM transactions t
     JOIN users fu ON fu.id = t.from_user_id
     JOIN users tu ON tu.id = t.to_user_id
     WHERE t.from_user_id = $1 OR t.to_user_id = $1

     UNION ALL

     SELECT
       'gm_' || gm.id                                                       AS id,
       'group'                                                               AS source,
       gm.type::text,
       CASE WHEN gm.from_user_id = $1 THEN 'sent' ELSE 'received' END      AS direction,
       gm.amount::float                                                      AS amount,
       gm.description,
       gm.currency,
       gm.created_at,
       u.name                                                                AS other_name,
       u.color_code                                                          AS other_color,
       g.name                                                                AS group_name,
       g.color_code                                                          AS group_color
     FROM group_messages gm
     JOIN groups g  ON g.id  = gm.group_id
     JOIN users  u  ON u.id  = gm.from_user_id
     WHERE gm.group_id IN (
       SELECT group_id FROM group_members WHERE user_id = $1
     )

     ORDER BY created_at DESC
     LIMIT 100`,
    [userId]
  );
  return result.rows;
};

module.exports = { getLatest, getWithFriend, createTransaction, getAuditLog, getRecentFriends, markComplete };
