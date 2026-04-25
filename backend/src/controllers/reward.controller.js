const User = require('../models/user.model');
const RewardConfig = require('../models/rewardConfig.model');
const Target = require('../models/target.model');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get current user's reward points and history
// @route   GET /api/v1/rewards/my-rewards
exports.getMyRewards = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('rewardPoints pointHistory');
        
        // Fetch active targets for their role
        const config = await RewardConfig.findOne({ key: 'global' });
        
        let roleKey = req.user.role;
        if (roleKey === 'sales_executive') roleKey = 'salesExecutive';
        
        // Map backend roles to frontend Target types
        const targetTypeMap = {
            'retailer': 'Retailer',
            'distributor': 'Distributor',
            'sales_executive': 'Sales Executive',
            'admin': 'Staff'
        };

        const targets = await Target.find({ 
            type: targetTypeMap[req.user.role],
            status: 'Active'
        });

        return ApiResponse.success(res, {
            balance: user.rewardPoints,
            history: user.pointHistory,
            earningRules: config ? config.earningRules[roleKey] : null,
            targets: targets
        }, 'Reward data fetched');
    } catch (error) {
        next(error);
    }
};
