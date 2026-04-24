const User = require('../models/user.model');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all users (Sub-admins, Distributors, Retailers, Customers)
// @route   GET /api/v1/admin/users
exports.getUsers = async (req, res, next) => {
    try {
        const filters = {};
        if (req.query.role) filters.role = req.query.role;
        if (req.query.status) {
            filters.isActive = req.query.status === 'active';
        }

        const users = await User.find(filters).select('-password');
        
        // Map database records to the frontend expectations
        const mappedUsers = users.map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            role: u.role, // 'admin', 'distributor', etc
            subRole: u.subRole,
            permissions: u.permissions || [],
            status: u.isActive ? 'active' : 'inactive',
            lastLogin: u.lastLogin,
            createdAt: u.createdAt
        }));

        return ApiResponse.success(res, mappedUsers, 'Users fetched successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new User (Admin, Sub-admin, etc)
// @route   POST /api/v1/admin/users
exports.createUser = async (req, res, next) => {
    try {
        const { name, email, role, subRole, permissions, department } = req.body;

        if (!name || !email || !role) {
            return ApiResponse.error(res, "Name, Email, and Role are required", 400);
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return ApiResponse.error(res, "A user with this email already exists", 400);
        }

        const user = await User.create({
            name,
            email,
            role,
            subRole: subRole || null,
            permissions: permissions || [],
            isActive: true
        });

        const mappedUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            subRole: user.subRole,
            permissions: user.permissions,
            status: user.isActive ? 'active' : 'inactive',
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
        };

        return ApiResponse.success(res, mappedUser, 'User created successfully', 201);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a User
// @route   PUT /api/v1/admin/users/:id
exports.updateUser = async (req, res, next) => {
    try {
        const { name, email, role, subRole, permissions, status } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return ApiResponse.error(res, "User not found", 404);
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (subRole !== undefined) user.subRole = subRole;
        if (permissions) user.permissions = permissions;
        if (status) user.isActive = status === 'active';

        await user.save();

        const mappedUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            subRole: user.subRole,
            permissions: user.permissions,
            status: user.isActive ? 'active' : 'inactive',
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
        };

        return ApiResponse.success(res, mappedUser, 'User updated successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a User
// @route   DELETE /api/v1/admin/users/:id
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return ApiResponse.error(res, "User not found", 404);
        }

        if (user.subRole === 'super_admin') {
            return ApiResponse.error(res, "Cannot delete Super Admin", 403);
        }

        await User.deleteOne({ _id: user._id });

        return ApiResponse.success(res, null, 'User deleted successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Get all distributors (for Admin ops screens)
// @route   GET /api/v1/admin/distributors
exports.getDistributors = async (req, res, next) => {
    try {
        const filters = { role: 'distributor' };
        if (req.query.status) {
            filters.isActive = req.query.status === 'active';
        }

        const users = await User.find(filters).select('-password').sort({ createdAt: -1 });
        const mapped = users.map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            businessName: u.businessName,
            location: u.location,
            status: u.isActive ? 'active' : 'pending',
            lastLogin: u.lastLogin,
            createdAt: u.createdAt
        }));

        return ApiResponse.success(res, mapped, 'Distributors fetched successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Activate/Disable a distributor
// @route   PUT /api/v1/admin/distributors/:id/status
exports.updateDistributorStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!status) {
            return ApiResponse.error(res, "Status is required (active/inactive)", 400);
        }

        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'distributor') {
            return ApiResponse.error(res, "Distributor not found", 404);
        }

        user.isActive = status === 'active';
        await user.save();

        return ApiResponse.success(res, {
            id: user._id,
            status: user.isActive ? 'active' : 'pending'
        }, 'Distributor status updated successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Get all retailers (for Admin ops screens)
// @route   GET /api/v1/admin/retailers
exports.getRetailers = async (req, res, next) => {
    try {
        const filters = { role: 'retailer' };
        if (req.query.status) {
            filters.isActive = req.query.status === 'active';
        }

        const users = await User.find(filters).populate('distributor', 'name businessName').select('-password').sort({ createdAt: -1 });
        const mapped = users.map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            shopName: u.shopName,
            location: u.location,
            distributor: u.distributor ? { id: u.distributor._id, name: u.distributor.name, businessName: u.distributor.businessName } : null,
            status: u.isActive ? 'active' : 'pending',
            lastLogin: u.lastLogin,
            createdAt: u.createdAt
        }));

        return ApiResponse.success(res, mapped, 'Retailers fetched successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Activate/Disable a retailer
// @route   PUT /api/v1/admin/retailers/:id/status
exports.updateRetailerStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!status) {
            return ApiResponse.error(res, "Status is required (active/inactive)", 400);
        }

        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'retailer') {
            return ApiResponse.error(res, "Retailer not found", 404);
        }

        const wasInactive = !user.isActive;
        user.isActive = status === 'active';
        await user.save();

        // Award retailerActivationBonus to the sales rep who onboarded this retailer
        if (status === 'active' && wasInactive && user.onboardedBy) {
            try {
                const RewardConfig = require('../models/rewardConfig.model');
                const config = await RewardConfig.findOne({ key: 'global' });
                const bonus = config?.earningRules?.salesExecutive?.retailerActivationBonus || 100;

                await User.findByIdAndUpdate(user.onboardedBy, {
                    $inc: { 'salesExecutiveData.totalPoints': bonus }
                });
            } catch (e) {
                console.error('Failed to award activation bonus:', e.message);
            }
        }

        return ApiResponse.success(res, {
            id: user._id,
            status: user.isActive ? 'active' : 'pending'
        }, 'Retailer status updated successfully');
    } catch (error) {
        next(error);
    }
};
