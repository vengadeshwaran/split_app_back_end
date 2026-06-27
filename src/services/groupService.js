const db = require('../config/db');

const createGroup = async (userId, name, colorCode, memberIds) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const groupRes = await client.query(
      `INSERT INTO groups (name, color_code, created_by) VALUES ($1, $2, $3) RETURNING *`,
      [name.trim(), colorCode, userId]
    );
    const group = groupRes.rows[0];

    const allMembers = [...new Set([userId, ...memberIds.map(Number)])];
    for (const memberId of allMembers) {
      await client.query(
        `INSERT INTO group_members (group_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [group.id, memberId]
      );
    }

    await client.query('COMMIT');
    return group;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getUserGroups = async (userId) => {
  const result = await db.query(
    `SELECT g.id, g.name, g.color_code, g.created_by, g.created_at,
            COUNT(DISTINCT gm.user_id) AS member_count,
            MAX(msg.created_at) AS last_activity
     FROM groups g
     JOIN group_members gm ON gm.group_id = g.id
     LEFT JOIN group_messages msg ON msg.group_id = g.id
     WHERE g.id IN (
       SELECT group_id FROM group_members WHERE user_id = $1
     )
     GROUP BY g.id
     ORDER BY COALESCE(MAX(msg.created_at), g.created_at) DESC`,
    [userId]
  );
  return result.rows;
};

const getGroupById = async (groupId) => {
  const groupRes = await db.query(
    `SELECT g.id, g.name, g.color_code, g.created_by, g.created_at
     FROM groups g WHERE g.id = $1`,
    [groupId]
  );
  if (groupRes.rows.length === 0) return null;
  const group = groupRes.rows[0];

  const membersRes = await db.query(
    `SELECT u.id, u.name, u.color_code
     FROM group_members gm
     JOIN users u ON u.id = gm.user_id
     WHERE gm.group_id = $1
     ORDER BY u.name`,
    [groupId]
  );
  group.members = membersRes.rows;
  return group;
};

const updateGroup = async (groupId, { name, colorCode }) => {
  const updates = [];
  const values  = [];
  let idx = 1;
  if (name)      { updates.push(`name = $${idx++}`);       values.push(name.trim()); }
  if (colorCode) { updates.push(`color_code = $${idx++}`); values.push(colorCode); }
  if (updates.length === 0) throw new Error('Nothing to update');
  values.push(groupId);
  const result = await db.query(
    `UPDATE groups SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
};

const removeMember = async (groupId, userId) => {
  await db.query(
    `DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`,
    [groupId, userId]
  );
};

const getGroupMessages = async (groupId, currentUserId) => {
  const result = await db.query(
    `SELECT gm.id, gm.group_id, gm.from_user_id, gm.type,
            gm.description, gm.amount, gm.currency, gm.created_at,
            u.name AS from_name, u.color_code AS from_color,
            ges.amount::float AS my_share,
            EXISTS (
              SELECT 1 FROM group_expense_splits ges2 WHERE ges2.message_id = gm.id
            ) AS has_splits
     FROM group_messages gm
     JOIN users u ON u.id = gm.from_user_id
     LEFT JOIN group_expense_splits ges
       ON ges.message_id = gm.id AND ges.user_id = $2
     WHERE gm.group_id = $1
     ORDER BY gm.created_at ASC`,
    [groupId, currentUserId]
  );
  return result.rows;
};

const addMessage = async (groupId, fromUserId, { type, description, amount, currency = 'AED', splits = [] }) => {
  const result = await db.query(
    `INSERT INTO group_messages (group_id, from_user_id, type, description, amount, currency)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [groupId, fromUserId, type, description || '', Number(amount), currency]
  );
  const msg = result.rows[0];

  if (type === 'expense' && splits.length > 0) {
    for (const split of splits) {
      if (Number(split.userId) === Number(fromUserId)) continue; // payer has no split row
      await db.query(
        `INSERT INTO group_expense_splits (message_id, user_id, amount)
         VALUES ($1, $2, $3) ON CONFLICT (message_id, user_id) DO NOTHING`,
        [msg.id, split.userId, parseFloat(split.amount)]
      );
    }
  }

  return msg;
};

const getMessageById = async (groupId, messageId) => {
  const msgRes = await db.query(
    `SELECT gm.id, gm.group_id, gm.from_user_id, gm.type,
            gm.description, gm.amount, gm.currency, gm.created_at,
            u.name AS from_name, u.color_code AS from_color
     FROM group_messages gm
     JOIN users u ON u.id = gm.from_user_id
     WHERE gm.id = $1 AND gm.group_id = $2`,
    [messageId, groupId]
  );
  if (msgRes.rows.length === 0) return null;
  const msg = msgRes.rows[0];

  const splitsRes = await db.query(
    `SELECT user_id, amount::float FROM group_expense_splits WHERE message_id = $1`,
    [messageId]
  );
  const splitsMap = {};
  for (const s of splitsRes.rows) {
    splitsMap[s.user_id] = Number(s.amount);
  }
  const hasSplits = Object.keys(splitsMap).length > 0;

  const settlementsRes = await db.query(
    `SELECT user_id FROM group_message_settlements WHERE message_id = $1`,
    [messageId]
  );
  const settledUserIds = new Set(settlementsRes.rows.map((r) => r.user_id));

  if (hasSplits) {
    const splitUserIds = Object.keys(splitsMap).map(Number);
    const membersRes = await db.query(
      `SELECT u.id, u.name, u.color_code
       FROM users u WHERE u.id = ANY($1::int[])
       ORDER BY u.name`,
      [splitUserIds]
    );
    const splitSum   = Object.values(splitsMap).reduce((a, b) => a + b, 0);
    const payerShare = parseFloat((Number(msg.amount) - splitSum).toFixed(2));

    msg.members = [
      ...membersRes.rows.map((m) => ({
        ...m,
        settled:  settledUserIds.has(m.id),
        amount:   parseFloat(Number(splitsMap[m.id]).toFixed(2)),
        is_payer: false,
      })),
      {
        id:         msg.from_user_id,
        name:       msg.from_name,
        color_code: msg.from_color,
        settled:    true,
        amount:     payerShare >= 0 ? payerShare : 0,
        is_payer:   true,
      },
    ];
  } else {
    // Legacy expenses without splits — equal share across all group members
    const membersRes = await db.query(
      `SELECT u.id, u.name, u.color_code
       FROM group_members gm
       JOIN users u ON u.id = gm.user_id
       WHERE gm.group_id = $1
       ORDER BY u.name`,
      [groupId]
    );
    const equalShare = parseFloat((Number(msg.amount) / (membersRes.rows.length || 1)).toFixed(2));
    msg.members = membersRes.rows.map((m) => ({
      ...m,
      settled:  settledUserIds.has(m.id) || Number(m.id) === Number(msg.from_user_id),
      amount:   equalShare,
      is_payer: Number(m.id) === Number(msg.from_user_id),
    }));
  }

  return msg;
};

const settleExpense = async (messageId, userId) => {
  await db.query(
    `INSERT INTO group_message_settlements (message_id, user_id)
     VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [messageId, userId]
  );
};

const getGroupBalances = async (groupId) => {
  const membersRes = await db.query(
    `SELECT u.id, u.name, u.color_code
     FROM group_members gm JOIN users u ON u.id = gm.user_id
     WHERE gm.group_id = $1 ORDER BY u.name`,
    [groupId]
  );
  const members = membersRes.rows;
  if (members.length === 0) return [];

  const expensesRes = await db.query(
    `SELECT id, from_user_id, amount FROM group_messages
     WHERE group_id = $1 AND type = 'expense' ORDER BY created_at ASC`,
    [groupId]
  );
  const expenses = expensesRes.rows;

  const balances = {};
  for (const m of members) {
    balances[m.id] = { ...m, total_owed: 0, total_settled: 0, expense_count: 0 };
  }

  if (expenses.length === 0) {
    return Object.values(balances).map((b) => ({
      ...b,
      total_owed:    0,
      total_settled: 0,
      pending:       0,
    }));
  }

  const expenseIds = expenses.map((e) => e.id);

  const splitsRes = await db.query(
    `SELECT message_id, user_id, amount::float FROM group_expense_splits
     WHERE message_id = ANY($1::int[])`,
    [expenseIds]
  );
  const splitsMap = {};
  for (const s of splitsRes.rows) {
    if (!splitsMap[s.message_id]) splitsMap[s.message_id] = {};
    splitsMap[s.message_id][s.user_id] = Number(s.amount);
  }

  const settlementsRes = await db.query(
    `SELECT s.message_id, s.user_id
     FROM group_message_settlements s
     JOIN group_messages gm ON gm.id = s.message_id
     WHERE gm.group_id = $1`,
    [groupId]
  );
  const settledSet = new Set(settlementsRes.rows.map((r) => `${r.message_id}_${r.user_id}`));

  for (const exp of expenses) {
    const expSplits = splitsMap[exp.id];
    const isLegacy  = !expSplits;

    for (const m of members) {
      if (Number(m.id) === Number(exp.from_user_id)) continue;

      let share;
      if (isLegacy) {
        share = Number(exp.amount) / members.length;
      } else {
        share = expSplits[m.id];
        if (!share || share <= 0) continue; // member not included in this split
      }

      balances[m.id].total_owed   += share;
      balances[m.id].expense_count += 1;
      if (settledSet.has(`${exp.id}_${m.id}`)) {
        balances[m.id].total_settled += share;
      }
    }
  }

  return Object.values(balances).map((b) => ({
    ...b,
    total_owed:    parseFloat(b.total_owed.toFixed(2)),
    total_settled: parseFloat(b.total_settled.toFixed(2)),
    pending:       parseFloat((b.total_owed - b.total_settled).toFixed(2)),
  }));
};

const settleMemberAllExpenses = async (groupId, memberId) => {
  await db.query(
    `INSERT INTO group_message_settlements (message_id, user_id)
     SELECT gm.id, $2
     FROM group_messages gm
     WHERE gm.group_id = $1
       AND gm.type = 'expense'
       AND gm.from_user_id != $2
       AND (
         EXISTS (SELECT 1 FROM group_expense_splits WHERE message_id = gm.id AND user_id = $2)
         OR NOT EXISTS (SELECT 1 FROM group_expense_splits WHERE message_id = gm.id)
       )
       AND NOT EXISTS (
         SELECT 1 FROM group_message_settlements
         WHERE message_id = gm.id AND user_id = $2
       )
     ON CONFLICT DO NOTHING`,
    [groupId, memberId]
  );
};

const getMyGroupBalances = async (groupId, currentUserId) => {
  const memberCountRes = await db.query(
    `SELECT COUNT(*) AS cnt FROM group_members WHERE group_id = $1`, [groupId]);
  const memberCount = parseInt(memberCountRes.rows[0].cnt, 10);
  if (memberCount === 0) return { i_owe: [], owed_to_me: [] };

  const expensesRes = await db.query(
    `SELECT gm.id, gm.from_user_id, gm.amount,
            u.name AS payer_name, u.color_code AS payer_color
     FROM group_messages gm
     JOIN users u ON u.id = gm.from_user_id
     WHERE gm.group_id = $1 AND gm.type = 'expense'`,
    [groupId]
  );
  const expenses = expensesRes.rows;
  if (expenses.length === 0) return { i_owe: [], owed_to_me: [] };

  const expenseIds = expenses.map((e) => e.id);
  const splitsRes = await db.query(
    `SELECT message_id, user_id, amount::float FROM group_expense_splits
     WHERE message_id = ANY($1::int[])`,
    [expenseIds]
  );
  const splitsMap = {};
  for (const s of splitsRes.rows) {
    if (!splitsMap[s.message_id]) splitsMap[s.message_id] = {};
    splitsMap[s.message_id][s.user_id] = Number(s.amount);
  }

  const settlementsRes = await db.query(
    `SELECT s.message_id, s.user_id
     FROM group_message_settlements s
     JOIN group_messages gm ON gm.id = s.message_id
     WHERE gm.group_id = $1`,
    [groupId]
  );
  const settledSet = new Set(settlementsRes.rows.map((r) => `${r.message_id}_${r.user_id}`));

  const otherMembersRes = await db.query(
    `SELECT u.id, u.name, u.color_code
     FROM group_members gm JOIN users u ON u.id = gm.user_id
     WHERE gm.group_id = $1 AND u.id != $2 ORDER BY u.name`,
    [groupId, currentUserId]
  );
  const otherMembers = otherMembersRes.rows;

  const iOweMap     = {};
  const owedToMeMap = {};

  for (const exp of expenses) {
    const payerId   = Number(exp.from_user_id);
    const expSplits = splitsMap[exp.id];
    const isLegacy  = !expSplits;

    if (payerId !== Number(currentUserId)) {
      // Someone else paid — do I owe them?
      let myShare;
      if (isLegacy) {
        myShare = Number(exp.amount) / memberCount;
      } else {
        myShare = expSplits[currentUserId];
        if (!myShare || myShare <= 0) continue; // I'm not in this split
      }

      if (!iOweMap[payerId]) {
        iOweMap[payerId] = {
          user_id: payerId, name: exp.payer_name, color_code: exp.payer_color,
          total_owed: 0, total_settled: 0,
        };
      }
      iOweMap[payerId].total_owed += myShare;
      if (settledSet.has(`${exp.id}_${currentUserId}`)) {
        iOweMap[payerId].total_settled += myShare;
      }
    } else {
      // I paid — who owes me?
      for (const m of otherMembers) {
        let theirShare;
        if (isLegacy) {
          theirShare = Number(exp.amount) / memberCount;
        } else {
          theirShare = expSplits[m.id];
          if (!theirShare || theirShare <= 0) continue; // member not in this split
        }

        if (!owedToMeMap[m.id]) {
          owedToMeMap[m.id] = {
            user_id: m.id, name: m.name, color_code: m.color_code,
            total_owed: 0, total_settled: 0,
          };
        }
        owedToMeMap[m.id].total_owed += theirShare;
        if (settledSet.has(`${exp.id}_${m.id}`)) {
          owedToMeMap[m.id].total_settled += theirShare;
        }
      }
    }
  }

  const fmt = (obj) => ({
    ...obj,
    total_owed:    parseFloat(obj.total_owed.toFixed(2)),
    total_settled: parseFloat(obj.total_settled.toFixed(2)),
    pending:       parseFloat((obj.total_owed - obj.total_settled).toFixed(2)),
  });

  return {
    i_owe:      Object.values(iOweMap).map(fmt),
    owed_to_me: Object.values(owedToMeMap).map(fmt),
  };
};

const settlePairwise = async (groupId, settlerUserId, payerUserId) => {
  await db.query(
    `INSERT INTO group_message_settlements (message_id, user_id)
     SELECT gm.id, $2
     FROM group_messages gm
     WHERE gm.group_id = $1
       AND gm.type = 'expense'
       AND gm.from_user_id = $3
       AND (
         EXISTS (SELECT 1 FROM group_expense_splits WHERE message_id = gm.id AND user_id = $2)
         OR NOT EXISTS (SELECT 1 FROM group_expense_splits WHERE message_id = gm.id)
       )
       AND NOT EXISTS (
         SELECT 1 FROM group_message_settlements
         WHERE message_id = gm.id AND user_id = $2
       )
     ON CONFLICT DO NOTHING`,
    [groupId, settlerUserId, payerUserId]
  );
};

const getGroupPendingRequests = async (groupId, userId) => {
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
       u.name       AS from_name,
       u.color_code AS from_color
     FROM transactions t
     JOIN users u ON u.id = t.from_user_id
     WHERE t.type    = 'request'
       AND t.status  = 'pending'
       AND t.to_user_id = $2
       AND t.from_user_id IN (
         SELECT user_id FROM group_members WHERE group_id = $1
       )
     ORDER BY t.created_at DESC`,
    [groupId, userId]
  );
  return result.rows;
};

module.exports = {
  createGroup, getUserGroups, getGroupById, updateGroup, removeMember,
  getGroupMessages, addMessage,
  getMessageById, settleExpense, getGroupBalances, settleMemberAllExpenses,
  getMyGroupBalances, settlePairwise, getGroupPendingRequests,
};
