const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/reward.controller');
const { protect } = require('../middleware/auth.middleware');

// All reward routes require authentication
router.use(protect);

router.get('/my-rewards', rewardController.getMyRewards);

module.exports = router;
