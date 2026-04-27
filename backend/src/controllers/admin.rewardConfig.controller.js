const RewardConfig = require('../models/rewardConfig.model');
const Target = require('../models/target.model');
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
        const targets = await Target.find().sort('-createdAt');
        
        // Aggregate points per role
        const User = require('../models/user.model');
        const pointAggregation = await User.aggregate([
            { $match: { role: { $in: ['retailer', 'distributor', 'sales_executive'] } } },
            { $group: { _id: '$role', total: { $sum: '$rewardPoints' } } }
        ]);

        const roleTotals = {
            retailer: pointAggregation.find(a => a._id === 'retailer')?.total || 0,
            distributor: pointAggregation.find(a => a._id === 'distributor')?.total || 0,
            salesExecutive: pointAggregation.find(a => a._id === 'sales_executive')?.total || 0
        };

        return ApiResponse.success(res, { config, targets, roleTotals }, 'Reward config fetched');
    } catch (err) { next(err); }
};

// @desc  PUT /api/v1/admin/reward-config/rules/:role
exports.updateRules = async (req, res, next) => {
    try {
        const { role } = req.params;
        const config = await getOrCreate();
        Object.assign(config.earningRules[role], req.body);
        config.markModified('earningRules');
        await config.save();
        return ApiResponse.success(res, config.earningRules, 'Earning rules updated');
    } catch (err) { next(err); }
};

// @desc  POST /api/v1/admin/reward-config/targets
exports.createTarget = async (req, res, next) => {
    try {
        const target = await Target.create(req.body);
        return ApiResponse.success(res, target, 'Campaign created', 201);
    } catch (err) { next(err); }
};

// @desc  PUT /api/v1/admin/reward-config/targets/:id
exports.updateTarget = async (req, res, next) => {
    try {
        const target = await Target.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return ApiResponse.success(res, target, 'Campaign updated');
    } catch (err) { next(err); }
};

// @desc  DELETE /api/v1/admin/reward-config/targets/:id
exports.deleteTarget = async (req, res, next) => {
    try {
        await Target.findByIdAndDelete(req.params.id);
        return ApiResponse.success(res, null, 'Campaign deleted');
    } catch (err) { next(err); }
};
