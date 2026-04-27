const Redemption = require('../models/redemption.model');
const User = require('../models/user.model');
const RewardConfig = require('../models/rewardConfig.model');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Create a new redemption request
 * @route   POST /api/v1/rewards/redemptions/request
 */
exports.createRequest = catchAsync(async (req, res) => {
    const { points, bankDetails } = req.body;

    if (!points || points <= 0) {
        return ApiResponse.error(res, 'Invalid points amount', 400);
    }

    const user = await User.findById(req.user._id);
    if (user.rewardPoints < points) {
        return ApiResponse.error(res, 'Insufficient reward points balance', 400);
    }

    const config = await RewardConfig.findOne({ key: 'global' });
    const ratio = config?.systemConfig?.pointToRupeeRatio || 1;
    const cashValue = points * ratio;

    const redemption = await Redemption.create({
        user: req.user._id,
        pointsRequested: points,
        cashValue,
        bankDetails,
        status: 'pending'
    });

    // Deduct points immediately (on hold)
    user.rewardPoints -= points;
    user.pointHistory.unshift({
        amount: points,
        reason: `Redemption Request: ${redemption._id}`,
        type: 'debit',
        timestamp: new Date()
    });
    await user.save();

    return ApiResponse.success(res, redemption, 'Redemption request submitted successfully', 201);
});

/**
 * @desc    Get all redemption requests (Admin)
 * @route   GET /api/v1/rewards/redemptions/admin/all
 */
exports.getAllRequests = catchAsync(async (req, res) => {
    const redemptions = await Redemption.find()
        .populate('user', 'name email role shopName phone')
        .sort('-createdAt');

    return ApiResponse.success(res, redemptions, 'All redemption requests fetched');
});

/**
 * @desc    Get my redemption requests
 * @route   GET /api/v1/rewards/redemptions/my-requests
 */
exports.getMyRequests = catchAsync(async (req, res) => {
    const redemptions = await Redemption.find({ user: req.user._id }).sort('-createdAt');
    return ApiResponse.success(res, redemptions, 'Your redemption requests fetched');
});

/**
 * @desc    Update redemption status (Admin)
 * @route   PATCH /api/v1/rewards/redemptions/admin/:id
 */
exports.updateStatus = catchAsync(async (req, res) => {
    const { status, adminNote } = req.body;
    const redemption = await Redemption.findById(req.params.id);

    if (!redemption) {
        return ApiResponse.error(res, 'Redemption request not found', 404);
    }

    if (redemption.status !== 'pending') {
        return ApiResponse.error(res, 'Only pending requests can be updated', 400);
    }

    if (status === 'rejected') {
        // Refund points if rejected
        const user = await User.findById(redemption.user);
        if (user) {
            user.rewardPoints += redemption.pointsRequested;
            user.pointHistory.unshift({
                amount: redemption.pointsRequested,
                reason: `Redemption Rejected (Refund): ${redemption._id}`,
                type: 'credit',
                timestamp: new Date()
            });
            await user.save();
        }
    }

    redemption.status = status;
    redemption.adminNote = adminNote;
    redemption.processedAt = new Date();
    redemption.processedBy = req.user._id;
    await redemption.save();

    return ApiResponse.success(res, redemption, `Redemption request ${status}`);
});
