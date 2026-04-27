const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const ServiceRequest = require('../models/serviceRequest.model');
const ApiResponse = require('../utils/apiResponse');

// Protect all technician routes — must be logged in as a technician/technician_manager
router.use(protect);
router.use((req, res, next) => {
    const allowed = ['technician', 'technician_manager'];
    if (!allowed.includes(req.user.subRole)) {
        return ApiResponse.error(res, 'Access restricted to technicians', 403);
    }
    next();
});

// @desc  GET /api/v1/technician/my-tickets  — tickets assigned to the logged-in technician
router.get('/my-tickets', async (req, res, next) => {
    try {
        const tickets = await ServiceRequest.find({ assignedTechnician: req.user._id })
            .populate('customer', 'name email')
            .populate('registeredProduct', 'productName serialNumber category')
            .sort({ createdAt: -1 });

        return ApiResponse.success(res, tickets, 'Tickets fetched');
    } catch (err) {
        next(err);
    }
});

// @desc  GET /api/v1/technician/all-tickets  — all tickets (technician_manager only)
router.get('/all-tickets', async (req, res, next) => {
    try {
        if (req.user.subRole !== 'technician_manager') {
            return ApiResponse.error(res, 'Access restricted to technician managers', 403);
        }
        const tickets = await ServiceRequest.find()
            .populate('customer', 'name email')
            .populate('registeredProduct', 'productName serialNumber category city state mobileNumber')
            .populate('assignedTechnician', 'name email')
            .sort({ createdAt: -1 });

        return ApiResponse.success(res, tickets, 'All tickets fetched');
    } catch (err) {
        next(err);
    }
});

// @desc  GET /api/v1/technician/technicians  — approved technicians list (technician_manager only)
router.get('/technicians', async (req, res, next) => {
    try {
        if (req.user.subRole !== 'technician_manager') {
            return ApiResponse.error(res, 'Access restricted to technician managers', 403);
        }
        const User = require('../models/user.model');
        const technicians = await User.find({
            subRole: 'technician',
            approvalStatus: 'approved',
            isActive: true
        }).select('name email phone location');

        return ApiResponse.success(res, technicians, 'Technicians fetched');
    } catch (err) {
        next(err);
    }
});

// @desc  PATCH /api/v1/technician/all-tickets/:id/assign  — assign technician (manager only)
router.patch('/all-tickets/:id/assign', async (req, res, next) => {
    try {
        if (req.user.subRole !== 'technician_manager') {
            return ApiResponse.error(res, 'Access restricted to technician managers', 403);
        }
        const { assignedTechnician, note } = req.body;
        const ticket = await ServiceRequest.findById(req.params.id);
        if (!ticket) return ApiResponse.error(res, 'Ticket not found', 404);

        ticket.assignedTechnician = assignedTechnician;
        ticket.status = 'Assigned';
        ticket.history.push({
            status: 'Assigned',
            note: note || 'Technician assigned by service manager.',
            updatedBy: req.user._id
        });
        await ticket.save();

        const updated = await ServiceRequest.findById(ticket._id)
            .populate('customer', 'name email')
            .populate('registeredProduct', 'productName serialNumber category')
            .populate('assignedTechnician', 'name email');

        return ApiResponse.success(res, updated, 'Technician assigned');
    } catch (err) {
        next(err);
    }
});

module.exports = router;
