const SalaryAdjustment = require('../models/salaryAdjustment.model');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const { v4: uuidv4 } = require('uuid');

/**
 * @desc    Get all salary adjustments
 * @route   GET /api/v1/admin/accounts/adjustments
 */
exports.getAdjustments = catchAsync(async (req, res, next) => {
    const adjustments = await SalaryAdjustment.find()
        .populate('employee', 'name email role subRole')
        .sort('-createdAt');

    // Stats for the current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const monthlyAdjustments = adjustments.filter(a => a.applicableMonth === currentMonth);
    const netChange = monthlyAdjustments.reduce((acc, a) => {
        return a.type === 'bonus' ? acc + a.amount : acc - a.amount;
    }, 0);

    const pending = adjustments.filter(a => a.status === 'pending').length;
    const approved = adjustments.filter(a => a.status === 'approved').length;

    return ApiResponse.success(res, {
        adjustments,
        stats: {
            totalAdjustments: monthlyAdjustments.length,
            netChange,
            pendingCount: pending,
            approvedCount: approved
        }
    }, 'Salary adjustments fetched successfully');
});

/**
 * @desc    Create new salary adjustment
 * @route   POST /api/v1/admin/accounts/adjustments
 */
exports.createAdjustment = catchAsync(async (req, res, next) => {
    const { employeeId, type, category, amount, reason, applicableMonth } = req.body;

    if (!employeeId || !type || !category || !amount || !applicableMonth) {
        return ApiResponse.error(res, 'Missing required fields', 400);
    }

    const employee = await User.findById(employeeId);
    if (!employee) {
        return ApiResponse.error(res, 'Employee not found', 404);
    }

    const adjustment = await SalaryAdjustment.create({
        adjustmentId: `AD-${uuidv4().substring(0, 6).toUpperCase()}`,
        employee: employeeId,
        type,
        category,
        amount,
        reason,
        applicableMonth,
        createdBy: req.user._id
    });

    return ApiResponse.success(res, adjustment, 'Adjustment created successfully', 201);
});

/**
 * @desc    Approve/Reject salary adjustment
 * @route   PATCH /api/v1/admin/accounts/adjustments/:id/approve
 */
exports.approveAdjustment = catchAsync(async (req, res, next) => {
    const { status } = req.body; // 'approved' or 'pending' (could also use 'rejected' if added to model)
    
    const adjustment = await SalaryAdjustment.findById(req.params.id);
    if (!adjustment) {
        return ApiResponse.error(res, 'Adjustment not found', 404);
    }

    adjustment.status = status || 'approved';
    adjustment.approvedBy = req.user._id;
    
    await adjustment.save();

    return ApiResponse.success(res, adjustment, `Adjustment ${adjustment.status} successfully`);
});
