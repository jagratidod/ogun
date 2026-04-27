const User = require('../models/user.model');
const RewardConfig = require('../models/rewardConfig.model');
const Target = require('../models/target.model');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get current user's reward points and history
// @route   GET /api/v1/rewards/my-rewards
exports.getMyRewards = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('rewardPoints pointHistory');
        const config = await RewardConfig.findOne({ key: 'global' });
        
        let roleKey = req.user.role;
        if (roleKey === 'sales_executive') roleKey = 'salesExecutive';
        
        const targetTypeMap = {
            'retailer': 'Retailer',
            'distributor': 'Distributor',
            'sales_executive': 'Sales Executive',
            'admin': 'Staff'
        };

        const targets = await Target.find({ 
            type: targetTypeMap[req.user.role] || 'Retailer',
            status: 'Active'
        });

        const Redemption = require('../models/redemption.model');
        const redemptions = await Redemption.find({ user: req.user._id }).sort('-createdAt');
        
        return ApiResponse.success(res, {
            balance: user.rewardPoints || 0,
            history: user.pointHistory || [],
            redemptions,
            earningRules: config ? config.earningRules[roleKey] : null,
            targets: targets,
            systemConfig: config ? config.systemConfig : { pointToRupeeRatio: 1 }
        }, 'Reward data fetched');
    } catch (error) { next(error); }
};

// @desc    Get global reward statistics for Admin
// @route   GET /api/v1/rewards/stats
exports.getRewardStats = async (req, res, next) => {
    try {
        const users = await User.find({ rewardPoints: { $gt: 0 } }).select('rewardPoints location role');
        const config = await RewardConfig.findOne({ key: 'global' });
        const targets = await Target.find({ status: 'Active' });

        const totalPoints = users.reduce((acc, u) => acc + u.rewardPoints, 0);
        const pointToRupeeRatio = config?.systemConfig?.pointToRupeeRatio || 1;

        // Regional distribution
        const regionalData = {};
        users.forEach(u => {
            const loc = u.location || 'Unknown';
            regionalData[loc] = (regionalData[loc] || 0) + u.rewardPoints;
        });

        const barChartData = Object.entries(regionalData).map(([name, val]) => ({ name, val }));

        return ApiResponse.success(res, {
            totalPoints,
            totalRupeeValue: totalPoints * pointToRupeeRatio,
            activePartners: users.length,
            barChartData,
            targets: targets.slice(0, 5), // Top 5 active targets
            systemConfig: config?.systemConfig
        }, 'Global reward stats fetched');
    } catch (error) { next(error); }
};

// @desc    Get leaderboard
// @route   GET /api/v1/rewards/leaderboard
exports.getLeaderboard = async (req, res, next) => {
    try {
        const topEarners = await User.find({ rewardPoints: { $gt: 0 } })
            .sort('-rewardPoints')
            .limit(10)
            .select('name rewardPoints role location');

        const leaderboard = topEarners.map((u, index) => ({
            rank: index + 1,
            name: u.name,
            points: u.rewardPoints,
            role: u.role,
            tier: u.rewardPoints > 5000 ? 'Platinum' : u.rewardPoints > 2000 ? 'Gold' : 'Silver'
        }));

        return ApiResponse.success(res, leaderboard, 'Leaderboard fetched');
    } catch (error) { next(error); }
};

// @desc    Get all point history for Admin
// @route   GET /api/v1/rewards/history
exports.getAllPointHistory = async (req, res, next) => {
    try {
        const users = await User.find({ 'pointHistory.0': { $exists: true } }).select('name pointHistory');
        
        let history = [];
        users.forEach(u => {
            u.pointHistory.forEach(h => {
                history.push({
                    name: u.name,
                    amount: h.amount,
                    reason: h.reason,
                    type: h.type,
                    timestamp: h.timestamp
                });
            });
        });

        history.sort((a, b) => b.timestamp - a.timestamp);

        return ApiResponse.success(res, history.slice(0, 100), 'All point history fetched');
    } catch (error) { next(error); }
};
