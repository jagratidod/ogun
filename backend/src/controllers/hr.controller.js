const User = require('../models/user.model');
const Leave = require('../models/leave.model');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all employees (Admins, Sales, Technicians)
// @route   GET /api/v1/hr/employees
exports.getEmployees = async (req, res, next) => {
    try {
        const employees = await User.find({ 
            role: { $in: ['admin', 'sales_executive', 'technician'] } 
        }).select('-password').sort({ createdAt: -1 });

        const mapped = employees.map(u => {
            let dept = u.department;
            const role = (u.role || '').toLowerCase();
            const sub = (u.subRole || '').toLowerCase();

            if (!dept || dept === 'General' || dept === '—') {
                if (role === 'sales_executive' || sub === 'sales_manager') dept = 'Sales';
                else if (role === 'technician' || sub === 'technician_manager' || sub === 'service_manager') dept = 'Technician';
                else if (sub === 'hr_manager') dept = 'HR';
                else if (sub === 'accounts_manager') dept = 'Finance';
                else dept = 'Operations';
            }

            return {
                id: u._id,
                name: u.name,
                email: u.email,
                role: u.role,
                subRole: u.subRole,
                department: dept,
                assignedArea: u.salesExecutiveData?.assignedArea || '—',
                status: u.isActive ? 'active' : 'inactive',
                lastLogin: u.lastLogin,
                createdAt: u.createdAt,
            };
        });

        return ApiResponse.success(res, mapped, 'Employees fetched successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Get all departments and their employees
// @route   GET /api/v1/hr/departments
exports.getDepartments = async (req, res, next) => {
    try {
        const employees = await User.find({ 
            role: { $in: ['admin', 'sales_executive', 'technician'] } 
        }).select('name email role subRole department isActive createdAt');

        const depts = {
            'Management': { id: 'DEP_MGT', name: 'Management', head: 'Pending', employees: [] },
            'HR': { id: 'DEP_HR', name: 'Human Resources', head: 'Pending', employees: [] },
            'Sales': { id: 'DEP_SLS', name: 'Sales', head: 'Pending', employees: [] },
            'Technician': { id: 'DEP_TECH', name: 'Technical Support', head: 'Pending', employees: [] },
            'Operations': { id: 'DEP_OPS', name: 'General Operations', head: 'Pending', employees: [] },
        };

        employees.forEach(emp => {
            let dept = emp.department;
            const role = (emp.role || '').toLowerCase();
            const sub = (emp.subRole || '').toLowerCase();

            if (!dept || dept === 'General' || dept === '—') {
                if (role === 'sales_executive' || sub === 'sales_manager') dept = 'Sales';
                else if (role === 'technician' || sub === 'technician_manager' || sub === 'service_manager') dept = 'Technician';
                else if (sub === 'hr_manager') dept = 'HR';
                else if (sub === 'accounts_manager') dept = 'Finance';
                else dept = 'Operations';
            }

            // Ensure we use the correct key for 'Technician'
            let deptKey = dept === 'Technician' ? 'Technician' : dept;
            if (!depts[deptKey]) {
                // If it's a custom department not in the list, put it in Operations or create it
                deptKey = depts[dept] ? dept : 'Operations';
            }

            depts[deptKey].employees.push({
                id: emp._id,
                name: emp.name,
                email: emp.email,
                role: emp.subRole || emp.role,
                status: emp.isActive ? 'active' : 'inactive',
                joined: emp.createdAt
            });

            if (depts[deptKey].head === 'Pending') depts[deptKey].head = emp.name;
        });

        const departmentList = Object.values(depts).filter(d => d.employees.length > 0);

        return ApiResponse.success(res, departmentList, 'Departments fetched successfully');
    } catch (error) {
        next(error);
    }
};


// @desc    Get all leave requests
// @route   GET /api/v1/hr/leaves
exports.getAllLeaves = async (req, res, next) => {
    try {
        // Only fetch leaves belonging to Sales Executives for HR review
        const leaves = await Leave.find()
            .populate({
                path: 'employee',
                match: { role: 'sales_executive' },
                select: 'name email role'
            })
            .sort({ createdAt: -1 });

        // Filter out leaves where employee populate returned null (non-sales users)
        const filteredLeaves = leaves.filter(leave => leave.employee !== null);

        return ApiResponse.success(res, filteredLeaves, 'Sales executive leave requests fetched');
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

// @desc    Apply for own leave (HR)
// @route   POST /api/v1/hr/my-leaves
exports.applyMyLeave = async (req, res, next) => {
    try {
        const { type, fromDate, toDate, reason } = req.body;

        if (!type || !fromDate || !toDate || !reason) {
            return ApiResponse.error(res, "All fields are required", 400);
        }

        const leave = await Leave.create({
            employee: req.user._id,
            type,
            fromDate,
            toDate,
            reason,
            status: 'pending'
        });

        return ApiResponse.success(res, leave, 'Leave application submitted successfully', 201);
    } catch (error) {
        next(error);
    }
};

// @desc    Get HR's own leave history
// @route   GET /api/v1/hr/my-leaves
exports.getMyLeaves = async (req, res, next) => {
    try {
        const leaves = await Leave.find({ employee: req.user._id })
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 });

        return ApiResponse.success(res, leaves, 'My leave history fetched');
    } catch (error) {
        next(error);
    }
};
