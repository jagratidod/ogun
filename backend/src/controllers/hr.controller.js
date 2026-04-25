const User = require('../models/user.model');
const Leave = require('../models/leave.model');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all employees (Admins and Sales Executives)
// @route   GET /api/v1/hr/employees
exports.getEmployees = async (req, res, next) => {
    try {
        const employees = await User.find({ 
            role: { $in: ['admin', 'sales_executive'] } 
        }).select('-password').sort({ createdAt: -1 });

        const mapped = employees.map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            subRole: u.subRole,
            assignedArea: u.salesExecutiveData?.assignedArea || '—',
            status: u.isActive ? 'active' : 'inactive',
            lastLogin: u.lastLogin,
            createdAt: u.createdAt,
        }));

        return ApiResponse.success(res, mapped, 'Employees fetched successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Get all leave requests
// @route   GET /api/v1/hr/leaves
exports.getAllLeaves = async (req, res, next) => {
    try {
        const leaves = await Leave.find()
            .populate('employee', 'name email role')
            .sort({ createdAt: -1 });

        return ApiResponse.success(res, leaves, 'All leave requests fetched');
    } catch (error) {
        next(error);
    }
};

// @desc    Approve or Reject a leave request
// @route   PATCH /api/v1/hr/leaves/:id/review
exports.reviewLeave = async (req, res, next) => {
    try {
        const { status, hrRemarks } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return ApiResponse.error(res, 'Status must be approved or rejected', 400);
        }

        const leave = await Leave.findById(req.params.id);
        if (!leave) return ApiResponse.error(res, 'Leave request not found', 404);

        leave.status = status;
        leave.hrRemarks = hrRemarks || '';
        leave.reviewedBy = req.user._id;
        leave.reviewedAt = Date.now();

        await leave.save();

        return ApiResponse.success(res, leave, `Leave request ${status} successfully`);
    } catch (error) {
        next(error);
    }
};
