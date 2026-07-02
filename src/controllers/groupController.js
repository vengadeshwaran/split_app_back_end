const groupService = require('../services/groupService');

const createGroup = async (req, res) => {
  try {
    const { name, colorCode, memberIds = [] } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Group name is required' });
    const group = await groupService.createGroup(req.user.userId, name, colorCode || 'bg-indigo-500', memberIds);
    res.status(201).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to create group' });
  }
};

const getUserGroups = async (req, res) => {
  try {
    const groups = await groupService.getUserGroups(req.user.userId);
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch groups' });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await groupService.getGroupById(Number(req.params.id));
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch group' });
  }
};

const getGroupMessages = async (req, res) => {
  try {
    const messages = await groupService.getGroupMessages(Number(req.params.id), req.user.userId);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch messages' });
  }
};

const addMessage = async (req, res) => {
  try {
    const { type, description, amount, currency, splits = [] } = req.body;
    if (!type || !amount) return res.status(400).json({ error: 'type and amount are required' });
    if (!['expense', 'payment'].includes(type)) return res.status(400).json({ error: 'type must be expense or payment' });
    if (Number(amount) <= 0) return res.status(400).json({ error: 'amount must be greater than 0' });

    const msg = await groupService.addMessage(
      Number(req.params.id),
      req.user.userId,
      { type, description, amount, currency, splits }
    );
    res.status(201).json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to add message' });
  }
};

const getMessageById = async (req, res) => {
  try {
    const msg = await groupService.getMessageById(Number(req.params.id), Number(req.params.messageId));
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch message' });
  }
};

const settleExpense = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    await groupService.settleExpense(Number(req.params.messageId), Number(userId));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to mark as settled' });
  }
};

const getGroupBalances = async (req, res) => {
  try {
    const balances = await groupService.getGroupBalances(Number(req.params.id));
    res.json(balances);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch balances' });
  }
};

const settleMemberAllExpenses = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    await groupService.settleMemberAllExpenses(Number(req.params.id), Number(userId));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to settle member' });
  }
};

const getMyGroupBalances = async (req, res) => {
  try {
    const data = await groupService.getMyGroupBalances(Number(req.params.id), req.user.userId);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch balances' });
  }
};

const settlePairwise = async (req, res) => {
  try {
    const { settlerUserId, payerUserId } = req.body;
    if (!settlerUserId || !payerUserId) return res.status(400).json({ error: 'settlerUserId and payerUserId are required' });
    await groupService.settlePairwise(Number(req.params.id), Number(settlerUserId), Number(payerUserId));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to settle' });
  }
};

const updateGroup = async (req, res) => {
  try {
    const groupId = Number(req.params.id);
    const { name, colorCode } = req.body;
    const updated = await groupService.updateGroup(groupId, { name, colorCode });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to update group' });
  }
};

const addMember = async (req, res) => {
  try {
    const groupId = Number(req.params.id);
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    await groupService.addMember(groupId, Number(userId));
    const group = await groupService.getGroupById(groupId);
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to add member' });
  }
};

const removeMember = async (req, res) => {
  try {
    const groupId = Number(req.params.id);
    const userId  = Number(req.params.userId);
    await groupService.removeMember(groupId, userId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to remove member' });
  }
};

const getGroupPendingRequests = async (req, res) => {
  try {
    const requests = await groupService.getGroupPendingRequests(
      Number(req.params.id),
      req.user.userId
    );
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch pending requests' });
  }
};

module.exports = {
  createGroup, getUserGroups, getGroupById, updateGroup, addMember, removeMember,
  getGroupMessages, addMessage,
  getMessageById, settleExpense, getGroupBalances, settleMemberAllExpenses,
  getMyGroupBalances, settlePairwise, getGroupPendingRequests,
};
