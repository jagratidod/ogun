const User = require('../models/user.model');
const Leave = require('../models/leave.model');
const Payroll = require('../models/payroll.model');
const ApiResponse = require('../utils/apiResponse');

const FREE_LEAVE_DAYS = 2;  // Per month free leave allowance
const WORKING_DAYS = 26;    // Standard Indian industry working days/month

// Helper: compute payroll records for a given month
async function computeRecords(month, year) {
    // Get all internal staff (admin + sales_executive + technician)
    const employees = await User.find({
        role: { $in: ['admin', 'sales_executive', 'technician'] },
        isActive: true,
        salary: { $gt: 0 }
    }).select('name department salary bankDetails role subRole');

    // Build date range for the month
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0, 23, 59, 59);  // last day of month

    const records = [];

    for (const emp of employees) {
        // Count approved leave days in this month
        const leaves = await Leave.find({
            employee: emp._id,
            status: 'approved',
            fromDate: { $lte: to },
            toDate: { $gte: from }
        });

        let totalLeaveDays = 0;
        leaves.forEach(leave => {
            const leaveFrom = leave.fromDate < from ? from : leave.fromDate;
            const leaveTo = leave.toDate > to ? to : leave.toDate;
            const days = Math.round((leaveTo - leaveFrom) / (1000 * 60 * 60 * 24)) + 1;
            totalLeaveDays += days;
        });

        const unpaidDays = Math.max(0, totalLeaveDays - FREE_LEAVE_DAYS);
        const perDayRate = emp.salary / WORKING_DAYS;
        const leaveDeduction = Math.round(unpaidDays * perDayRate);
        const netPay = emp.salary - leaveDeduction;

        // Default department logic
        let dept = emp.department;
        const role = (emp.role || '').toLowerCase();
        const sub = (emp.subRole || '').toLowerCase();

        // Auto-assign based on role/subRole if department is missing or generic
        if (!dept || dept === 'General' || dept === '—') {
            if (role === 'sales_executive' || sub === 'sales_manager') dept = 'Sales';
            else if (role === 'technician' || sub === 'technician_manager' || sub === 'service_manager') dept = 'Technician';
            else if (sub === 'hr_manager') dept = 'HR';
            else if (sub === 'accounts_manager') dept = 'Finance';
            else if (!dept) dept = 'General';
        }

        records.push({
            employee: emp._id,
            employeeName: emp.name,
            department: dept,
            grossPay: emp.salary,
            leaveDays: totalLeaveDays,
            freeLeaveAllowance: FREE_LEAVE_DAYS,
            leaveDeduction,
            otherDeductions: 0,
            netPay,
            bankDetails: emp.bankDetails || {},
            status: 'pending'
        });
    }

    return records;
}




// @desc    List all employees with salary & bank details (HR view)
// @route   GET /api/v1/hr/payroll/employees
exports.getEmployeeSalaries = async (req, res, next) => {
    try {
        const employees = await User.find({
            role: { $in: ['admin', 'sales_executive', 'technician'] },
            isActive: true
        }).select('name email role subRole department salary bankDetails createdAt');

        const mapped = employees.map(emp => {
            let dept = emp.department;
            const role = (emp.role || '').toLowerCase();
            const sub = (emp.subRole || '').toLowerCase();

            // Auto-assign based on role/subRole if department is missing or generic
            if (!dept || dept === 'General' || dept === '—') {
                if (role === 'sales_executive' || sub === 'sales_manager') dept = 'Sales';
                else if (role === 'technician' || sub === 'technician_manager' || sub === 'service_manager') dept = 'Technician';
                else if (sub === 'hr_manager') dept = 'HR';
                else if (sub === 'accounts_manager') dept = 'Finance';
                else if (!dept) dept = 'General';
            }

            return {
                id: emp._id,
                name: emp.name,
                email: emp.email,
                role: emp.subRole || emp.role,
                department: dept,
                salary: emp.salary || 0,
                bankDetails: emp.bankDetails || {}
            };
        });



        return ApiResponse.success(res, mapped, 'Employee salary data fetched');
    } catch (err) { next(err); }
};


// @desc    Update an employee's salary and bank details
// @route   PATCH /api/v1/hr/payroll/employees/:id
exports.updateEmployeeSalary = async (req, res, next) => {
    try {
        const { salary, department, bankDetails } = req.body;

        const emp = await User.findById(req.params.id);
        if (!emp) return ApiResponse.error(res, 'Employee not found', 404);

        if (salary !== undefined) emp.salary = salary;
        if (department) emp.department = department;
        if (bankDetails) emp.bankDetails = { ...emp.bankDetails, ...bankDetails };

        await emp.save();
        return ApiResponse.success(res, emp, 'Employee salary updated');
    } catch (err) { next(err); }
};

// @desc    Preview payroll computation for a month (no save)
// @route   GET /api/v1/hr/payroll/preview?month=YYYY-MM
exports.previewPayroll = async (req, res, next) => {
    try {
        const { month } = req.query; // format: "2026-04"
        if (!month) return ApiResponse.error(res, 'month query parameter is required (YYYY-MM)', 400);

        const [year, mon] = month.split('-').map(Number);
        const records = await computeRecords(mon, year);

        const totalGross = records.reduce((a, r) => a + r.grossPay, 0);
        const totalDeductions = records.reduce((a, r) => a + r.leaveDeduction + r.otherDeductions, 0);
        const totalNet = records.reduce((a, r) => a + r.netPay, 0);

        return ApiResponse.success(res, {
            month,
            totalGross,
            totalDeductions,
            totalNet,
            employeeCount: records.length,
            records
        }, 'Payroll preview computed');
    } catch (err) { next(err); }
};

// @desc    Run payroll — save to DB
// @route   POST /api/v1/hr/payroll/runs
exports.runPayroll = async (req, res, next) => {
    try {
        const { month } = req.body; // "2026-04"
        if (!month) return ApiResponse.error(res, 'month is required (YYYY-MM)', 400);

        // Prevent duplicate runs
        const existing = await Payroll.findOne({ month });
        if (existing) return ApiResponse.error(res, `Payroll for ${month} already exists`, 409);

        const [year, mon] = month.split('-').map(Number);
        const records = await computeRecords(mon, year);

        if (records.length === 0) return ApiResponse.error(res, 'No employees with salary configured found', 400);

        const totalGross = records.reduce((a, r) => a + r.grossPay, 0);
        const totalDeductions = records.reduce((a, r) => a + r.leaveDeduction + r.otherDeductions, 0);
        const totalNet = records.reduce((a, r) => a + r.netPay, 0);

        const monthLabel = new Date(year, mon - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

        const payroll = await Payroll.create({
            month,
            monthLabel,
            year,
            status: 'draft',
            totalGross,
            totalDeductions,
            totalNet,
            employeeCount: records.length,
            records,
            processedBy: req.user._id
        });

        return ApiResponse.success(res, payroll, 'Payroll run created successfully', 201);
    } catch (err) { next(err); }
};

// @desc    Get all payroll runs
// @route   GET /api/v1/hr/payroll/runs
exports.getPayrollRuns = async (req, res, next) => {
    try {
        const runs = await Payroll.find()
            .populate('processedBy', 'name')
            .populate('approvedBy', 'name')
            .sort('-createdAt')
            .select('-records'); // Exclude heavy records from list view

        return ApiResponse.success(res, runs, 'Payroll runs fetched');
    } catch (err) { next(err); }
};

// @desc    Get a single payroll run with all employee records
// @route   GET /api/v1/hr/payroll/runs/:id
exports.getPayrollRun = async (req, res, next) => {
    try {
        const run = await Payroll.findById(req.params.id)
            .populate('processedBy', 'name')
            .populate('approvedBy', 'name');

        if (!run) return ApiResponse.error(res, 'Payroll run not found', 404);
        return ApiResponse.success(res, run, 'Payroll run fetched');
    } catch (err) { next(err); }
};

// @desc    Approve and mark payroll as disbursed (ALL)
// @route   PATCH /api/v1/hr/payroll/runs/:id/approve
exports.approvePayroll = async (req, res, next) => {
    try {
        const run = await Payroll.findById(req.params.id);
        if (!run) return ApiResponse.error(res, 'Payroll run not found', 404);
        if (run.status === 'disbursed') return ApiResponse.error(res, 'Payroll already disbursed', 400);

        run.status = 'disbursed';
        run.approvedBy = req.user._id;
        run.approvedAt = new Date();
        
        // Mark all records as paid
        run.records.forEach(r => { r.status = 'paid'; });
        
        await run.save();

        // --- Phase 4: Payroll Ledger Integration ---
        try {
            const Transaction = require('../models/transaction.model');
            const { v4: uuidv4 } = require('uuid');

            await Transaction.create({
                transactionId: `TXN-PAY-${uuidv4().substring(0, 8).toUpperCase()}`,
                type: 'expense',
                category: 'payroll',
                description: `Payroll disbursed for ${run.monthLabel}`,
                amount: run.totalNet,
                status: 'completed',
                relatedPayroll: run._id,
                partyRole: 'admin',
                paymentMethod: 'system',
                createdBy: req.user._id
            });
        } catch (txnError) {
            console.error('Failed to create payroll transaction:', txnError.message);
        }

        return ApiResponse.success(res, run, 'All employees marked as paid and payroll disbursed');
    } catch (err) { next(err); }
};

// @desc    Mark individual employee as paid
// @route   PATCH /api/v1/hr/payroll/runs/:runId/records/:recordId/pay
exports.payIndividualEmployee = async (req, res, next) => {
    try {
        const { runId, recordId } = req.params;
        const run = await Payroll.findById(runId);
        if (!run) return ApiResponse.error(res, 'Payroll run not found', 404);

        const record = run.records.id(recordId);
        if (!record) return ApiResponse.error(res, 'Record not found', 404);
        if (record.status === 'paid') return ApiResponse.error(res, 'Employee already paid', 400);

        record.status = 'paid';

        // Check if all records are now paid
        const allPaid = run.records.every(r => r.status === 'paid');
        if (allPaid) {
            run.status = 'disbursed';
            run.approvedBy = req.user._id;
            run.approvedAt = new Date();
        }

        await run.save();
        return ApiResponse.success(res, run, 'Employee marked as paid');
    } catch (err) { next(err); }
};


// @desc    Get payroll dashboard stats
// @route   GET /api/v1/hr/payroll/stats
exports.getPayrollStats = async (req, res, next) => {
    try {
        const runs = await Payroll.find().sort('-createdAt').limit(6).select('-records');
        const lastRun = runs[0];

        const trend = runs.reverse().map(r => ({
            month: r.monthLabel,
            payout: r.totalNet,
            deductions: r.totalDeductions
        }));

        const employees = await User.countDocuments({
            role: { $in: ['admin', 'sales_executive', 'technician'] },
            isActive: true,
            salary: { $gt: 0 }
        });


        return ApiResponse.success(res, {
            lastRunMonth: lastRun?.monthLabel || '—',
            lastRunTotal: lastRun?.totalNet || 0,
            lastRunStatus: lastRun?.status || '—',
            employeesOnPayroll: employees,
            trend
        }, 'Payroll stats fetched');
    } catch (err) { next(err); }
};
// @desc    Delete a payroll run (only if not disbursed)
// @route   DELETE /api/v1/hr/payroll/runs/:id
exports.deletePayrollRun = async (req, res, next) => {
    try {
        const payroll = await Payroll.findById(req.params.id);
        if (!payroll) return ApiResponse.error(res, 'Payroll run not found', 404);

        await Payroll.findByIdAndDelete(req.params.id);

        return ApiResponse.success(res, null, 'Payroll run deleted successfully');
    } catch (err) { next(err); }
};
