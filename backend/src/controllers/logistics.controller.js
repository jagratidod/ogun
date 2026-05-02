const Shipment = require('../models/shipment.model');
const ProductOrder = require('../models/productOrder.model');
const User = require('../models/user.model');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get Logistics Dashboard Stats
// @route   GET /api/v1/logistics/stats
exports.getDashboardStats = async (req, res, next) => {
    try {
        const totalShipments = await Shipment.countDocuments();
        const inTransit = await Shipment.countDocuments({ status: 'In Transit' });
        
        // Delivered Today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const deliveredToday = await Shipment.countDocuments({ 
            status: 'Delivered', 
            deliveredAt: { $gte: startOfDay } 
        });

        const cancelled = await Shipment.countDocuments({ status: 'Cancelled' });

        // Pending restock requests
        const restockRequests = await ProductOrder.countDocuments({ 
            status: 'Pending',
            orderType: { $in: ['retailer_to_distributor', 'distributor_to_admin'] }
        });

        const stats = {
            totalShipments,
            inTransit,
            deliveredToday,
            cancelled,
            restockRequests
        };

        return ApiResponse.success(res, stats, 'Logistics stats fetched');
    } catch (error) {
        next(error);
    }
};

// @desc    Get All Shipments (Unified View)
// @route   GET /api/v1/logistics/shipments
exports.getAllShipments = async (req, res, next) => {
    try {
        const filters = {};
        if (req.query.status) filters.status = req.query.status;
        if (req.query.direction) filters.direction = req.query.direction;

        const shipments = await Shipment.find(filters)
            .populate('sender', 'name businessName location')
            .populate('recipient', 'name businessName location')
            .populate('assignedAgent', 'name phone')
            .populate('products.product', 'name sku')
            .sort({ createdAt: -1 });

        return ApiResponse.success(res, shipments, 'All shipments fetched');
    } catch (error) {
        next(error);
    }
};

// @desc    Get Order Pipeline (All orders)
// @route   GET /api/v1/logistics/orders
exports.getOrderPipeline = async (req, res, next) => {
    try {
        const orders = await ProductOrder.find()
            .populate('buyer', 'name businessName shopName role')
            .populate('seller', 'name businessName role')
            .populate('products.product', 'name sku')
            .sort({ createdAt: -1 });

        return ApiResponse.success(res, orders, 'Order pipeline fetched');
    } catch (error) {
        next(error);
    }
};

// @desc    Get Tracking Info
// @route   GET /api/v1/logistics/tracking/:id
exports.getTrackingInfo = async (req, res, next) => {
    try {
        const shipment = await Shipment.findOne({ 
            $or: [{ shipmentId: req.params.id }, { trackingNumber: req.params.id }] 
        })
        .populate('sender', 'name businessName location')
        .populate('recipient', 'name businessName location')
        .populate('products.product', 'name sku images');

        if (!shipment) {
            return ApiResponse.error(res, 'Shipment not found', 404);
        }

        return ApiResponse.success(res, shipment, 'Tracking data fetched');
    } catch (error) {
        next(error);
    }
};

// @desc    Update Shipment Status & Timeline
// @route   PATCH /api/v1/logistics/shipments/:id/status
exports.updateShipmentStatus = async (req, res, next) => {
    try {
        const { status, location, note } = req.body;
        const shipment = await Shipment.findById(req.params.id);

        if (!shipment) {
            return ApiResponse.error(res, 'Shipment not found', 404);
        }

        shipment.status = status;
        if (status === 'Delivered') shipment.deliveredAt = Date.now();
        if (status === 'In Transit' && !shipment.dispatchedAt) shipment.dispatchedAt = Date.now();

        // Add to timeline
        shipment.trackingTimeline.push({
            status,
            location: location || 'Transit Node',
            timestamp: Date.now(),
            note: note || `Status updated to ${status}`
        });

        await shipment.save();

        return ApiResponse.success(res, shipment, 'Shipment status updated');
    } catch (error) {
        next(error);
    }
};

// @desc    Assign Delivery Agent to Shipment
// @route   PATCH /api/v1/logistics/shipments/:id/assign
exports.assignAgent = async (req, res, next) => {
    try {
        const { agentId } = req.body;
        const shipment = await Shipment.findById(req.params.id);

        if (!shipment) {
            return ApiResponse.error(res, 'Shipment not found', 404);
        }

        const agent = await User.findById(agentId);
        if (!agent || agent.subRole !== 'delivery_agent') {
            return ApiResponse.error(res, 'Valid delivery agent not found', 404);
        }

        shipment.assignedAgent = agentId;
        shipment.trackingTimeline.push({
            status: shipment.status,
            location: 'Logistics Hub',
            timestamp: Date.now(),
            note: `Shipment assigned to agent ${agent.name}`
        });

        await shipment.save();
        return ApiResponse.success(res, shipment, 'Agent assigned successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Get Detailed Analytics
// @route   GET /api/v1/logistics/analytics
exports.getAnalytics = async (req, res, next) => {
    try {
        // Shipment volume by status
        const statusDistribution = await Shipment.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Monthly volume
        const monthlyVolume = await Shipment.aggregate([
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Average transit time (Pending to Delivered)
        const transitEfficiency = await Shipment.aggregate([
            { $match: { status: 'Delivered', dispatchedAt: { $exists: true } } },
            {
                $project: {
                    durationHrs: {
                        $divide: [{ $subtract: ['$deliveredAt', '$dispatchedAt'] }, 3600000]
                    }
                }
            },
            { $group: { _id: null, avgHrs: { $avg: '$durationHrs' } } }
        ]);

        // Route Efficiency (Success rate of deliveries)
        const totalShipments = await Shipment.countDocuments();
        const deliveredShipments = await Shipment.countDocuments({ status: 'Delivered' });
        const routeEfficiency = totalShipments > 0 ? (deliveredShipments / totalShipments) * 100 : 0;

        // Fleet Utilization (Active agents vs Total agents)
        const totalAgents = await User.countDocuments({ subRole: 'delivery_agent' });
        const activeAgents = await Shipment.distinct('assignedAgent', { status: { $in: ['In Transit', 'Out for Delivery'] } });
        const fleetUtilization = totalAgents > 0 ? (activeAgents.length / totalAgents) * 100 : 0;

        return ApiResponse.success(res, {
            statusDistribution,
            monthlyVolume,
            avgTransitTime: transitEfficiency[0]?.avgHrs || 0,
            routeEfficiency,
            fleetUtilization
        }, 'Analytics data fetched');
    } catch (error) {
        next(error);
    }
};

// @desc    Get All Restock Requests
// @route   GET /api/v1/logistics/restock
exports.getRestockRequests = async (req, res, next) => {
    try {
        const requests = await ProductOrder.find({ 
            status: { $in: ['Pending', 'Confirmed'] },
            orderType: { $in: ['retailer_to_distributor', 'distributor_to_admin'] }
        })
        .populate('buyer', 'name businessName shopName role location')
        .populate('products.product', 'name sku images')
        .sort({ createdAt: -1 });

        return ApiResponse.success(res, requests, 'Restock requests fetched');
    } catch (error) {
        next(error);
    }
};

// @desc    Get Delivery Agents
// @route   GET /api/v1/logistics/agents
exports.getDeliveryAgents = async (req, res, next) => {
    try {
        const agents = await User.find({ subRole: 'delivery_agent' }).select('name phone location email');
        
        // Add delivery stats to each agent
        const mappedAgents = await Promise.all(agents.map(async (a) => {
            const count = await Shipment.countDocuments({ assignedAgent: a._id });
            return {
                ...a.toObject(),
                deliveries: count,
                status: 'Active' // Simple mock status for now
            };
        }));

        return ApiResponse.success(res, mappedAgents, 'Delivery agents fetched');
    } catch (error) {
        next(error);
    }
};

// @desc    Create Delivery Agent (Onboarding)
// @route   POST /api/v1/logistics/agents
exports.createDeliveryAgent = async (req, res, next) => {
    try {
        const { name, phone, email, location, vehicleType } = req.body;

        if (!name || !phone || !email) {
            return ApiResponse.error(res, 'Name, Phone and Email are required', 400);
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return ApiResponse.error(res, 'A user with this email already exists', 400);
        }

        const agent = await User.create({
            name,
            email,
            phone,
            location,
            role: 'admin', // Delivery agents are part of the admin org but with specific subRole
            subRole: 'delivery_agent',
            preferences: {
                vehicleType
            },
            isActive: true
        });

        return ApiResponse.success(res, agent, 'Delivery agent onboarded successfully', 201);
    } catch (error) {
        next(error);
    }
};
