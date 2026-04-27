const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/reward.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// All reward routes require authentication
router.use(protect);

router.get('/my-rewards', rewardController.getMyRewards);
router.get('/leaderboard', rewardController.getLeaderboard);

// Admin only routes
router.get('/stats', restrictTo('admin'), rewardController.getRewardStats);
router.get('/history', restrictTo('admin'), rewardController.getAllPointHistory);

module.exports = router;
