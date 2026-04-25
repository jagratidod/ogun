const ServiceRequest = require('../models/serviceRequest.model');
const RegisteredProduct = require('../models/registeredProduct.model');
const WarrantyExtension = require('../models/warrantyExtension.model');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all service requests (Admin view)
// @route   GET /api/v1/admin/service-requests
exports.getAllServiceRequests = async (req, res, next) => {
    try {
        const requests = await ServiceRequest.find()
            .populate('customer', 'name email')
            .populate('registeredProduct', 'productName serialNumber category city state mobileNumber')
            .populate('assignedTechnician', 'name email')
            .sort({ createdAt: -1 });

        return ApiResponse.success(res, requests, 'All service requests fetched');
    } catch (error) {
        next(error);
    }
};

// @desc    Get single service request detail (Admin)
// @route   GET /api/v1/admin/service-requests/:id
exports.getServiceRequestDetail = async (req, res, next) => {
    try {
        const request = await ServiceRequest.findById(req.params.id)
            .populate('customer', 'name email')
            .populate('registeredProduct')
            .populate('assignedTechnician', 'name email')
            .populate('history.updatedBy', 'name');

        if (!request) {
            return ApiResponse.error(res, 'Service request not found', 404);
        }

        return ApiResponse.success(res, request, 'Service request detail fetched');
    } catch (error) {
        next(error);
    }
};

// @desc    Update service request status, assign technician, add remarks
// @route   PATCH /api/v1/admin/service-requests/:id/status
exports.updateServiceRequestStatus = async (req, res, next) => {
    try {
        const { status, assignedTechnician, adminRemarks, note } = req.body;

        const request = await ServiceRequest.findById(req.params.id);
        if (!request) {
            return ApiResponse.error(res, 'Service request not found', 404);
        }

        if (status) request.status = status;
        if (assignedTechnician) request.assignedTechnician = assignedTechnician;
        if (adminRemarks) request.adminRemarks = adminRemarks;
        if (status === 'Resolved' || status === 'Closed') {
            request.resolvedAt = new Date();
        }

        // Add history entry
        request.history.push({
            status: status || request.status,
            note: note || `Status updated to ${status}`,
            updatedBy: req.user._id
        });

        await request.save();

        const updated = await ServiceRequest.findById(request._id)
            .populate('customer', 'name email')
            .populate('registeredProduct', 'productName serialNumber category')
            .populate('assignedTechnician', 'name email');

        return ApiResponse.success(res, updated, 'Service request updated');
    } catch (error) {
        next(error);
    }
};

// @desc    Get service analytics (KPIs, trends, distributions)
// @route   GET /api/v1/admin/service/analytics
exports.getServiceAnalytics = async (req, res, next) => {
    try {
        const totalRequests = await ServiceRequest.countDocuments();
        const resolvedRequests = await ServiceRequest.countDocuments({ status: { $in: ['Resolved', 'Closed'] } });
        const openRequests = totalRequests - resolvedRequests;

        // 1. Issue Distribution by Category
        const categoryDist = await ServiceRequest.aggregate([
            { $group: { _id: "$issueCategory", count: { $sum: 1 } } },
            { $project: { name: "$_id", value: "$count", _id: 0 } }
        ]);

        // 2. Trend Data (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const trendData = await ServiceRequest.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    tickets: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } },
            { $project: { date: "$_id", tickets: 1, _id: 0 } }
        ]);

        // 3. Technician Performance
        const techPerformance = await ServiceRequest.aggregate([
            { $match: { assignedTechnician: { $ne: null } } },
            {
                $group: {
                    _id: "$assignedTechnician",
                    total: { $sum: 1 },
                    resolved: {
                        $sum: {
                            $cond: [{ $in: ["$status", ["Resolved", "Closed"]] }, 1, 0]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "tech"
                }
            },
            { $unwind: "$tech" },
            {
                $project: {
                    name: "$tech.name",
                    total: 1,
                    resolved: 1,
                    _id: 0
                }
            }
        ]);

        // 4. Warranty Revenue
        const revenueData = await WarrantyExtension.aggregate([
            { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        // 5. Avg Resolution Time (in hours)
        const resolvedDocs = await ServiceRequest.find({ 
            status: { $in: ['Resolved', 'Closed'] },
            resolvedAt: { $ne: null }
        });
        
        let totalHours = 0;
        resolvedDocs.forEach(doc => {
            const diff = doc.resolvedAt - doc.createdAt;
            totalHours += diff / (1000 * 60 * 60);
        });
        const avgResolutionTime = resolvedDocs.length > 0 ? (totalHours / resolvedDocs.length).toFixed(1) : 0;

        return ApiResponse.success(res, {
            stats: {
                totalRequests,
                resolvedRequests,
                openRequests,
                totalRevenue,
                avgResolutionTime
            },
            categoryDist,
            trendData,
            techPerformance
        }, 'Service analytics fetched');
    } catch (error) {
        next(error);
    }
};

// @desc    Get all registered products (Admin view)
// @route   GET /api/v1/admin/registered-products
exports.getAllRegisteredProducts = async (req, res, next) => {
    try {
        const products = await RegisteredProduct.find()
            .populate('customer', 'name email')
            .sort({ createdAt: -1 });

        return ApiResponse.success(res, products, 'All registered products fetched');
    } catch (error) {
        next(error);
    }
};
