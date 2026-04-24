const User = require('../models/user.model');
const ProductOrder = require('../models/productOrder.model');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all sales executives
// @route   GET /api/v1/admin/sales-reps
exports.getSalesReps = async (req, res, next) => {
    try {
        const filters = { role: 'sales_executive' };
        if (req.query.status) filters.isActive = req.query.status === 'active';

        const reps = await User.find(filters).select('-password').sort({ createdAt: -1 });

        const mapped = reps.map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            assignedArea: u.salesExecutiveData?.assignedArea || '—',
            totalPoints: u.salesExecutiveData?.totalPoints || 0,
            targets: u.salesExecutiveData?.targets || [],
            status: u.isActive ? 'active' : 'inactive',
            lastLogin: u.lastLogin,
            createdAt: u.createdAt,
        }));

        return ApiResponse.success(res, mapped, 'Sales representatives fetched successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new sales executive
// @route   POST /api/v1/admin/sales-reps
exports.createSalesRep = async (req, res, next) => {
    try {
        const { name, email, assignedArea } = req.body;

        if (!name || !email) {
            return ApiResponse.error(res, 'Name and Email are required', 400);
        }

        const exists = await User.findOne({ email: email.toLowerCase().trim() });
        if (exists) {
            return ApiResponse.error(res, 'A user with this email already exists', 400);
        }

        const rep = await User.create({
            name,
            email: email.toLowerCase().trim(),
            role: 'sales_executive',
            isActive: true,
            salesExecutiveData: {
                assignedArea: assignedArea || 'General',
                totalPoints: 0,
                targets: [],
            },
        });

        return ApiResponse.success(res, {
            id: rep._id,
            name: rep.name,
            email: rep.email,
            assignedArea: rep.salesExecutiveData.assignedArea,
            status: 'active',
        }, 'Sales representative created successfully', 201);
    } catch (error) {
        next(error);
    }
};

// @desc    Update sales rep status or area
// @route   PUT /api/v1/admin/sales-reps/:id
exports.updateSalesRep = async (req, res, next) => {
    try {
        const { name, assignedArea, status } = req.body;
        const rep = await User.findOne({ _id: req.params.id, role: 'sales_executive' });

        if (!rep) return ApiResponse.error(res, 'Sales representative not found', 404);

        if (name) rep.name = name;
        if (status) rep.isActive = status === 'active';
        if (assignedArea) {
            rep.salesExecutiveData = rep.salesExecutiveData || {};
            rep.salesExecutiveData.assignedArea = assignedArea;
        }

        await rep.save();
        return ApiResponse.success(res, { id: rep._id, status: rep.isActive ? 'active' : 'inactive' }, 'Updated successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Set monthly target for a sales rep
// @route   POST /api/v1/admin/sales-reps/:id/targets
exports.setTarget = async (req, res, next) => {
    try {
        const { month, salesTarget, retailersTarget } = req.body;

        if (!month || salesTarget == null || retailersTarget == null) {
            return ApiResponse.error(res, 'month, salesTarget, and retailersTarget are required', 400);
        }

        const rep = await User.findOne({ _id: req.params.id, role: 'sales_executive' });
        if (!rep) return ApiResponse.error(res, 'Sales representative not found', 404);

        if (!rep.salesExecutiveData) rep.salesExecutiveData = { targets: [] };
        if (!rep.salesExecutiveData.targets) rep.salesExecutiveData.targets = [];

        const idx = rep.salesExecutiveData.targets.findIndex(t => t.month === month);
        if (idx >= 0) {
            rep.salesExecutiveData.targets[idx].salesTarget = salesTarget;
            rep.salesExecutiveData.targets[idx].retailersTarget = retailersTarget;
        } else {
            rep.salesExecutiveData.targets.push({ month, salesTarget, retailersTarget, achievedSales: 0, achievedRetailers: 0 });
        }

        rep.markModified('salesExecutiveData');
        await rep.save();

        return ApiResponse.success(res, rep.salesExecutiveData.targets, 'Target set successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Get sales rep detail with retailers and orders
// @route   GET /api/v1/admin/sales-reps/:id
exports.getSalesRepDetail = async (req, res, next) => {
    try {
        const rep = await User.findOne({ _id: req.params.id, role: 'sales_executive' }).select('-password');
        if (!rep) return ApiResponse.error(res, 'Sales representative not found', 404);

        // Retailers onboarded by this rep
        const retailers = await User.find({ role: 'retailer', onboardedBy: rep._id })
            .select('name email shopName location isActive createdAt');

        // Orders placed by this rep
        const orders = await ProductOrder.find({ createdBy: rep._id })
            .populate('buyer', 'name shopName')
            .sort({ createdAt: -1 })
            .limit(50);

        const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // Sync current month achieved values into targets
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const targets = rep.salesExecutiveData?.targets || [];
        const monthIdx = targets.findIndex(t => t.month === currentMonth);
        if (monthIdx >= 0) {
            targets[monthIdx].achievedRetailers = retailers.length;
            targets[monthIdx].achievedSales = totalSales;
            rep.salesExecutiveData.targets = targets;
            rep.markModified('salesExecutiveData');
            await rep.save();
        }

        return ApiResponse.success(res, {
            rep: {
                id: rep._id,
                name: rep.name,
                email: rep.email,
                assignedArea: rep.salesExecutiveData?.assignedArea || '—',
                totalPoints: rep.salesExecutiveData?.totalPoints || 0,
                targets: rep.salesExecutiveData?.targets || [],
                status: rep.isActive ? 'active' : 'inactive',
                lastLogin: rep.lastLogin,
                createdAt: rep.createdAt,
            },
            retailers,
            orders,
            totalSales,
        }, 'Sales rep detail fetched');
    } catch (error) {
        next(error);
    }
};
