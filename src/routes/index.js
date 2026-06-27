const express = require('express');
const router = express.Router();
const authRoutes        = require('./authRoutes');
const userRoutes        = require('./userRoutes');
const friendRoutes      = require('./friendRoutes');
const transactionRoutes = require('./transactionRoutes');
const groupRoutes       = require('./groupRoutes');
const settingsRoutes    = require('./settingsRoutes');
const adminRoutes       = require('./adminRoutes');

router.use('/auth',         authRoutes);
router.use('/users',        userRoutes);
router.use('/friends',      friendRoutes);
router.use('/transactions', transactionRoutes);
router.use('/groups',       groupRoutes);
router.use('/settings',     settingsRoutes);
router.use('/admin',        adminRoutes);

module.exports = router;
