const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/',               verifyToken, groupController.getUserGroups);
router.post('/',              verifyToken, groupController.createGroup);
router.get('/:id',                   verifyToken, groupController.getGroupById);
router.patch('/:id',                 verifyToken, groupController.updateGroup);
router.delete('/:id/members/:userId',verifyToken, groupController.removeMember);
router.get('/:id/messages',          verifyToken, groupController.getGroupMessages);
router.post('/:id/messages',             verifyToken, groupController.addMessage);
router.get('/:id/messages/:messageId',          verifyToken, groupController.getMessageById);
router.post('/:id/messages/:messageId/settle',  verifyToken, groupController.settleExpense);
router.get('/:id/balances',                     verifyToken, groupController.getGroupBalances);
router.post('/:id/settle-member',               verifyToken, groupController.settleMemberAllExpenses);
router.get('/:id/my-balances',                  verifyToken, groupController.getMyGroupBalances);
router.post('/:id/settle-pairwise',             verifyToken, groupController.settlePairwise);

module.exports = router;
