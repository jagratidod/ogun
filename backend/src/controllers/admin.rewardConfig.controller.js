const RewardConfig = require('../models/rewardConfig.model');
const ApiResponse = require('../utils/apiResponse');

// Get or create the global reward config
const getOrCreate = async () => {
    let config = await RewardConfig.findOne({ key: 'global' });
    if (!config) config = await RewardConfig.create({ key: 'global' });
    return config;
};

// @desc  GET /api/v1/admin/reward-config
exports.getConfig = async (req, res, next) => {
    try {
        const config = await getOrCreate();
        return ApiResponse.success(res, config, 'Reward config fetched');
    } catch (err) { next(err); }
};

// @desc  PUT /api/v1/admin/reward-config/rules/:role
// role: retailer | distributor | salesExecutive
exports.updateRules = async (req, res, next) => {
    try {
        const { role } = req.params;
        const allowed = ['retailer', 'distributor', 'salesExecutive'];
        if (!allowed.includes(role)) {
            return ApiResponse.error(res, 'Invalid role. Use: retailer, distributor, salesExecutive', 400);
        }

        const config = await getOrCreate();
        Object.assign(config.earningRules[role], req.body);
        config.markModified('earningRules');
        await config.save();

        return ApiResponse.success(res, config.earningRules, 'Earning rules updated');
    } catch (err) { next(err); }
};
