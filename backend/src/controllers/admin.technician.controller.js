const User = require('../models/user.model');
const ServiceRequest = require('../models/serviceRequest.model');
const ApiResponse = require('../utils/apiResponse');
const bcrypt = require('bcryptjs');

// @desc    Get all technicians with their service stats
// @route   GET /api/v1/admin/technicians
exports.getTechnicians = async (req, res, next) => {
    try {
        const { status } = req.query; // optional filter: pending | approved | rejected
        const query = { subRole: 'technician' };
        if (status) query.approvalStatus = status;

        const technicians = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 });

        // Attach service stats for each technician
        const withStats = await Promise.all(technicians.map(async (tech) => {
            const total = await ServiceRequest.countDocuments({ assignedTechnician: tech._id });
            const resolved = await ServiceRequest.countDocuments({
                assignedTechnician: tech._id,
                status: { $in: ['Resolved', 'Closed'] }
            });
            const inProgress = await ServiceRequest.countDocuments({
                assignedTechnician: tech._id,
                status: 'In Progress'
            });
            const open = await ServiceRequest.countDocuments({
                assignedTechnician: tech._id,
                status: { $in: ['Open', 'Assigned'] }
            });

            return {
                _id: tech._id,
                name: tech.name,
                email: tech.email,
                phone: tech.phone || null,
                location: tech.location,
                isActive: tech.isActive,
                subRole: tech.subRole,
                approvalStatus: tech.approvalStatus,
                approvalNote: tech.approvalNote,
                createdAt: tech.createdAt,
                lastLogin: tech.lastLogin,
                stats: { total, resolved, inProgress, open }
            };
        }));

        return ApiResponse.success(res, withStats, 'Technicians fetched successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Get single technician detail with full service history
// @route   GET /api/v1/admin/technicians/:id
exports.getTechnicianDetail = async (req, res, next) => {
    try {
        const tech = await User.findOne({ _id: req.params.id, subRole: 'technician' }).select('-password');
        if (!tech) return ApiResponse.error(res, 'Technician not found', 404);

        const serviceRequests = await ServiceRequest.find({ assignedTechnician: tech._id })
            .populate('customer', 'name email')
            .populate('registeredProduct', 'productName serialNumber category')
            .sort({ createdAt: -1 });

        return ApiResponse.success(res, { technician: tech, serviceRequests }, 'Technician detail fetched');
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new technician
// @route   POST /api/v1/admin/technicians
exports.createTechnician = async (req, res, next) => {
    try {
        const { name, email, password, phone, location } = req.body;

        if (!name || !email || !password) {
            return ApiResponse.error(res, 'Name, email and password are required', 400);
        }

        const existing = await User.findOne({ email });
        if (existing) return ApiResponse.error(res, 'Email already in use', 400);

        const technician = await User.create({
            name,
            email,
            password,
            phone,
            location,
            role: 'admin',
            subRole: 'technician',
            isActive: true
        });

        const result = technician.toObject();
        delete result.password;

        return ApiResponse.success(res, result, 'Technician created successfully', 201);
    } catch (error) {
        next(error);
    }
};

// @desc    Update technician details
// @route   PUT /api/v1/admin/technicians/:id
exports.updateTechnician = async (req, res, next) => {
    try {
        const { name, email, phone, location, isActive } = req.body;

        const tech = await User.findOne({ _id: req.params.id, subRole: 'technician' });
        if (!tech) return ApiResponse.error(res, 'Technician not found', 404);

        if (name) tech.name = name;
        if (email) tech.email = email;
        if (phone !== undefined) tech.phone = phone;
        if (location !== undefined) tech.location = location;
        if (isActive !== undefined) tech.isActive = isActive;

        await tech.save();

        const result = tech.toObject();
        delete result.password;

        return ApiResponse.success(res, result, 'Technician updated successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a technician
// @route   DELETE /api/v1/admin/technicians/:id
exports.deleteTechnician = async (req, res, next) => {
    try {
        const tech = await User.findOne({ _id: req.params.id, subRole: 'technician' });
        if (!tech) return ApiResponse.error(res, 'Technician not found', 404);

        // Unassign from open tickets
        await ServiceRequest.updateMany(
            { assignedTechnician: tech._id, status: { $in: ['Open', 'Assigned', 'In Progress'] } },
            { $set: { assignedTechnician: null, status: 'Open' } }
        );

        await tech.deleteOne();
        return ApiResponse.success(res, null, 'Technician deleted successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Approve or reject a technician
// @route   PATCH /api/v1/admin/technicians/:id/approval
exports.updateApprovalStatus = async (req, res, next) => {
    try {
        const { status, note } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return ApiResponse.error(res, 'Status must be approved or rejected', 400);
        }

        const tech = await User.findOne({ _id: req.params.id, subRole: 'technician' });
        if (!tech) return ApiResponse.error(res, 'Technician not found', 404);

        tech.approvalStatus = status;
        tech.approvalNote = note || null;
        // Approved technicians become active, rejected ones become inactive
        tech.isActive = status === 'approved';

        await tech.save();

        return ApiResponse.success(res, {
            _id: tech._id,
            name: tech.name,
            approvalStatus: tech.approvalStatus,
            isActive: tech.isActive
        }, `Technician ${status} successfully`);
    } catch (error) {
        next(error);
    }
};
