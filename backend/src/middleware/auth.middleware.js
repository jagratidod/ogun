const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiResponse = require('../utils/apiResponse');

// @desc    Verify if user is authenticated
exports.protect = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return ApiResponse.error(res, "Not authorized to access this route", 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        
        const user = await User.findById(decoded.id);
        if (!user) {
            return ApiResponse.error(res, "The user belonging to this token no longer exists.", 401);
        }

        if (!user.isActive) {
            return ApiResponse.error(res, "This account is currently deactivated.", 403);
        }

        // Grant access to protected route
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return ApiResponse.error(res, "Token expired", 401);
        }
        return ApiResponse.error(res, "Invalid token", 401);
    }
};

// @desc    Authorize user based on role
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return ApiResponse.error(res, `Forbidden: Your role (${req.user.role.toUpperCase()}) does not have permission to access this resource. Required roles: ${roles.join(', ').toUpperCase()}`, 403);
        }
        next();
    };
};

// @desc    Authorize Admin sub-role permissions
exports.checkPermission = (permission) => {
    return (req, res, next) => {
        // Super admins have access to all
        if (req.user.subRole === 'super_admin') return next();

        // If it's a main admin (role: admin) with no specific subRole, grant full access
        if (req.user.role === 'admin' && !req.user.subRole) return next();

        if (!req.user.permissions || !req.user.permissions.includes(permission)) {
            return ApiResponse.error(res, "Insufficient privileges for this operation", 403);
        }
        next();
    };
};
