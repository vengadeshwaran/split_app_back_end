const transactionService = require('../services/transactionService');

const getLatest = async (req, res) => {
  try {
    const transactions = await transactionService.getLatest(req.user.userId, 10);
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch transactions' });
  }
};

const getWithFriend = async (req, res) => {
  try {
    const friendId = Number(req.params.friendId);
    if (!friendId) return res.status(400).json({ error: 'Invalid friendId' });
    const transactions = await transactionService.getWithFriend(req.user.userId, friendId);
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch transactions' });
  }
};

const create = async (req, res) => {
  try {
    const { toUserId, type, description, amount, currency = 'AED' } = req.body;

    if (!toUserId || !type || !amount) {
      return res.status(400).json({ error: 'toUserId, type, and amount are required' });
    }
    if (!['request', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'type must be request or expense' });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ error: 'amount must be greater than 0' });
    }

    const tx = await transactionService.createTransaction({
      fromUserId:  req.user.userId,
      toUserId:    Number(toUserId),
      type,
      description: description || '',
      amount:      Number(amount),
      currency,
    });

    res.status(201).json(tx);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create transaction' });
  }
};

const getRecentFriends = async (req, res) => {
  try {
    const friends = await transactionService.getRecentFriends(req.user.userId);
    res.json(friends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch recent friends' });
  }
};

const getAuditLog = async (req, res) => {
  try {
    const logs = await transactionService.getAuditLog(req.user.userId);
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch audit log' });
  }
};

const markComplete = async (req, res) => {
  try {
    const txId = Number(req.params.id);
    if (!txId) return res.status(400).json({ error: 'Invalid transaction id' });
    const tx = await transactionService.markComplete(txId, req.user.userId);
    res.json(tx);
  } catch (error) {
    console.error(error);
    res.status(error.message.includes('not authorized') ? 403 : 500)
      .json({ error: error.message || 'Unable to update transaction' });
  }
};

const accept = async (req, res) => {
  try {
    const txId = Number(req.params.id);
    if (!txId) return res.status(400).json({ error: 'Invalid transaction id' });
    const tx = await transactionService.acceptRequest(txId, req.user.userId);
    res.json(tx);
  } catch (error) {
    console.error(error);
    res.status(error.message.includes('not authorized') ? 403 : 500)
      .json({ error: error.message || 'Unable to accept request' });
  }
};

const decline = async (req, res) => {
  try {
    const txId = Number(req.params.id);
    if (!txId) return res.status(400).json({ error: 'Invalid transaction id' });
    const tx = await transactionService.declineRequest(txId, req.user.userId);
    res.json(tx);
  } catch (error) {
    console.error(error);
    res.status(error.message.includes('not authorized') ? 403 : 500)
      .json({ error: error.message || 'Unable to decline request' });
  }
};

module.exports = { getLatest, getWithFriend, create, getAuditLog, getRecentFriends, markComplete, accept, decline };
