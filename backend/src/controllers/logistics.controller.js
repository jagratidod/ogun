const mongoose = require('mongoose');
const Shipment = require('../models/shipment.model');

const ProductOrder = require('../models/productOrder.model');
const User = require('../models/user.model');
const TrackingLog = require('../models/trackingLog.model');
const Carrier = require('../models/carrier.model');
const ApiResponse = require('../utils/apiResponse');
const { v4: uuidv4 } = require('uuid');

// Helper to generate POD number
const generatePODNumber = () => `POD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;


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
        const query = {
            $or: [{ shipmentId: req.params.id }, { trackingNumber: req.params.id }]
        };

        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            query.$or.push({ _id: req.params.id });
        }

        const shipment = await Shipment.findOne(query)

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

// @desc    Create Shipment from Order (Start of Logistics Lifecycle)
// @route   POST /api/v1/logistics/shipments
exports.createShipmentFromOrder = async (req, res, next) => {
    try {
        const { orderId, direction } = req.body;
        const order = await ProductOrder.findById(orderId);

        if (!order) return ApiResponse.error(res, 'Order not found', 404);
        if (order.shipmentCreated) return ApiResponse.error(res, 'Shipment already exists for this order', 400);

        const podNumber = generatePODNumber();
        const shipment = await Shipment.create({
            shipmentId: `SHP-${uuidv4().substring(0, 8).toUpperCase()}`,
            podNumber,
            sender: order.seller,
            recipient: order.buyer,
            products: order.products.map(p => ({ product: p.product, quantity: p.quantity })),
            direction: direction || (order.orderType === 'distributor_to_admin' ? 'admin_to_distributor' : 'distributor_to_retailer'),
            status: 'Pending'
        });

        order.shipmentCreated = true;
        await order.save();

        // Log initial tracking
        await TrackingLog.create({
            shipment: shipment._id,
            podNumber,
            status: 'Shipment Created',
            location: 'System',
            remarks: 'Shipment initialized from order',
            updatedBy: req.user._id
        });

        return ApiResponse.success(res, shipment, 'Shipment intelligence initialized', 201);
    } catch (error) {
        next(error);
    }
};

// @desc    Add Packaging Details
// @route   PATCH /api/v1/logistics/shipments/:id/packaging
exports.addPackagingDetails = async (req, res, next) => {
    try {
        const { packages } = req.body; // Array of { weight, length, width, height, boxCount, fragileType }
        const shipment = await Shipment.findById(req.params.id);

        if (!shipment) return ApiResponse.error(res, 'Shipment not found', 404);

        shipment.packages = packages;
        
        // Calculate weights
        let totalActualWeight = 0;
        let totalVolumetricWeight = 0;

        packages.forEach(pkg => {
            totalActualWeight += pkg.weight * (pkg.boxCount || 1);
            totalVolumetricWeight += ((pkg.length * pkg.width * pkg.height) / 5000) * (pkg.boxCount || 1);
        });

        shipment.volumetricWeight = totalVolumetricWeight;
        shipment.billedWeight = Math.max(totalActualWeight, totalVolumetricWeight);
        shipment.status = 'Pending'; // Remains pending until carrier is assigned

        await shipment.save();

        await TrackingLog.create({
            shipment: shipment._id,
            podNumber: shipment.podNumber,
            status: 'Packed',
            location: 'Packaging Desk',
            remarks: `Total weight: ${shipment.billedWeight}kg`,
            updatedBy: req.user._id
        });

        return ApiResponse.success(res, shipment, 'Packaging details updated');
    } catch (error) {
        next(error);
    }
};

// @desc    Select Carrier and Assign Cost
// @route   PATCH /api/v1/logistics/shipments/:id/carrier
exports.selectCarrier = async (req, res, next) => {
    try {
        const { carrierId, cost, zone } = req.body;
        const shipment = await Shipment.findById(req.params.id);

        if (!shipment) return ApiResponse.error(res, 'Shipment not found', 404);

        shipment.carrierId = carrierId;
        shipment.freightCost = cost;
        shipment.zone = zone;

        await shipment.save();

        return ApiResponse.success(res, shipment, 'Carrier selected and cost assigned');
    } catch (error) {
        next(error);
    }
};

// @desc    Dispatch Shipment
// @route   PATCH /api/v1/logistics/shipments/:id/dispatch
exports.dispatchShipment = async (req, res, next) => {
    try {
        const shipment = await Shipment.findById(req.params.id);

        if (!shipment) return ApiResponse.error(res, 'Shipment not found', 404);
        if (!shipment.carrierId) return ApiResponse.error(res, 'Carrier must be assigned before dispatch', 400);

        shipment.status = 'In Transit';
        shipment.dispatchedAt = Date.now();

        await shipment.save();

        await TrackingLog.create({
            shipment: shipment._id,
            podNumber: shipment.podNumber,
            status: 'Dispatched',
            location: 'Logistics Hub',
            remarks: 'Shipment handed over to carrier',
            updatedBy: req.user._id
        });

        return ApiResponse.success(res, shipment, 'Shipment dispatched successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Add Tracking Update
// @route   POST /api/v1/logistics/shipments/:id/tracking
exports.addTrackingUpdate = async (req, res, next) => {
    try {
        const { status, location, remarks } = req.body;
        const shipment = await Shipment.findById(req.params.id);

        if (!shipment) return ApiResponse.error(res, 'Shipment not found', 404);

        const log = await TrackingLog.create({
            shipment: shipment._id,
            podNumber: shipment.podNumber,
            status,
            location,
            remarks,
            updatedBy: req.user._id
        });

        shipment.status = status;
        // Legacy timeline sync
        shipment.trackingTimeline.push({
            status,
            location,
            timestamp: Date.now(),
            note: remarks
        });

        await shipment.save();

        return ApiResponse.success(res, log, 'Tracking update added');
    } catch (error) {
        next(error);
    }
};

// @desc    Confirm Delivery (POD Closure)
// @route   PATCH /api/v1/logistics/shipments/:id/deliver
exports.confirmDelivery = async (req, res, next) => {
    try {
        const { deliveryProof, remarks } = req.body;
        const shipment = await Shipment.findById(req.params.id);

        if (!shipment) return ApiResponse.error(res, 'Shipment not found', 404);

        shipment.status = 'Delivered';
        shipment.deliveredAt = Date.now();
        shipment.podClosed = true;
        shipment.deliveryProof = deliveryProof;

        await shipment.save();

        await TrackingLog.create({
            shipment: shipment._id,
            podNumber: shipment.podNumber,
            status: 'Delivered',
            location: 'Destination',
            remarks: remarks || 'Delivered successfully',
            updatedBy: req.user._id
        });

        return ApiResponse.success(res, shipment, 'Delivery confirmed and POD closed');
    } catch (error) {
        next(error);
    }
};

// @desc    Public Tracking Lookup
// @route   GET /api/v1/logistics/public/track/:identifier
exports.getPublicTracking = async (req, res, next) => {
    try {
        const identifier = req.params.identifier;
        
        const shipment = await Shipment.findOne({
            $or: [
                { podNumber: identifier },
                { trackingNumber: identifier },
                { shipmentId: identifier }
            ]
        })
        .populate('sender', 'name businessName location')
        .populate('recipient', 'name businessName location')
        .populate('carrierId', 'name trackingUrl')
        .populate('products.product', 'name sku images');

        if (!shipment) return ApiResponse.error(res, 'Shipment not found', 404);

        const timeline = await TrackingLog.find({ shipment: shipment._id }).sort({ timestamp: -1 });

        return ApiResponse.success(res, { shipment, timeline }, 'Tracking data fetched');
    } catch (error) {
        next(error);
    }
};

// @desc    Get Packaging Queue (Pending Packaging)
// @route   GET /api/v1/logistics/packaging-queue
exports.getPackagingQueue = async (req, res, next) => {
    try {
        const shipments = await Shipment.find({
            status: 'Pending',
            'packages.0': { $exists: false }
        })
        .populate('recipient', 'name businessName location')
        .sort({ createdAt: -1 });

        return ApiResponse.success(res, shipments, 'Packaging queue fetched');
    } catch (error) {
        next(error);
    }
};

// @desc    Get Dispatch Queue (Awaiting Carrier/Dispatch)
// @route   GET /api/v1/logistics/dispatch-queue
exports.getDispatchQueue = async (req, res, next) => {
    try {
        const shipments = await Shipment.find({
            status: 'Pending',
            'packages.0': { $exists: true }
        })
        .populate('recipient', 'name businessName location')
        .populate('carrierId', 'name')
        .sort({ createdAt: -1 });

        return ApiResponse.success(res, shipments, 'Dispatch queue fetched');
    } catch (error) {
        next(error);
    }
};

