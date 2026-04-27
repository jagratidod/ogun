const User = require('../models/user.model');
const ProductOrder = require('../models/productOrder.model');
const Sale = require('../models/sale.model');
const ServiceRequest = require('../models/serviceRequest.model');
const Product = require('../models/product.model');
const Inventory = require('../models/inventory.model');
const ApiResponse = require('../utils/apiResponse');

// @desc  GET /api/v1/admin/dashboard
exports.getDashboard = async (req, res, next) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // ── Counts ──────────────────────────────────────────
        const [
            totalOrders,
            todayOrders,
            activeDistributors,
            activeRetailers,
            totalCustomers,
            openServiceRequests,
            pendingTechnicians,
        ] = await Promise.all([
            ProductOrder.countDocuments(),
            ProductOrder.countDocuments({ createdAt: { $gte: todayStart } }),
            User.countDocuments({ role: 'distributor', isActive: true }),
            User.countDocuments({ role: 'retailer', isActive: true }),
            User.countDocuments({ role: 'customer' }),
            ServiceRequest.countDocuments({ status: { $in: ['Open', 'Assigned'] } }),
            User.countDocuments({ subRole: 'technician', approvalStatus: 'pending' }),
        ]);

        // ── Revenue ─────────────────────────────────────────
        const todayRevenueAgg = await ProductOrder.aggregate([
            { $match: { createdAt: { $gte: todayStart }, status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const monthRevenueAgg = await ProductOrder.aggregate([
            { $match: { createdAt: { $gte: monthStart }, status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const todayRevenue = todayRevenueAgg[0]?.total || 0;
        const monthRevenue = monthRevenueAgg[0]?.total || 0;

        // ── Sales Trend (last 6 months) ──────────────────────
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const salesTrend = await ProductOrder.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%b %Y', date: '$createdAt' } },
                    sales: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } },
            { $project: { month: '$_id', sales: 1, orders: 1, _id: 0 } }
        ]);

        // ── Low Stock Alerts ─────────────────────────────────
        const lowStock = await Inventory.find({ quantity: { $lte: 10 } })
            .populate('product', 'name sku category')
            .sort({ quantity: 1 })
            .limit(5);

        const lowStockAlerts = lowStock.map(inv => ({
            id: inv._id,
            name: inv.product?.name || 'Unknown',
            sku: inv.product?.sku || '—',
            category: inv.product?.category || '—',
            stock: inv.quantity,
            minStock: 10
        }));

        // ── Pending Orders ───────────────────────────────────
        const pendingOrders = await ProductOrder.find({ status: 'Pending' })
            .populate('buyer', 'name shopName businessName')
            .sort({ createdAt: -1 })
            .limit(5);

        const pendingRequests = pendingOrders.map(o => ({
            id: o.orderId,
            retailer: o.buyer?.shopName || o.buyer?.businessName || o.buyer?.name || '—',
            items: o.products?.length || 0,
            total: o.totalAmount,
            status: o.status.toLowerCase()
        }));

        // ── Recent Activity ──────────────────────────────────
        const [recentOrders, recentServices] = await Promise.all([
            ProductOrder.find()
                .populate('buyer', 'name shopName businessName')
                .sort({ createdAt: -1 })
                .limit(4),
            ServiceRequest.find()
                .populate('customer', 'name')
                .sort({ createdAt: -1 })
                .limit(3)
        ]);

        const recentActivity = [
            ...recentOrders.map(o => ({
                id: o._id,
                type: 'order',
                message: `Order ${o.orderId} by ${o.buyer?.shopName || o.buyer?.name || 'Unknown'}`,
                status: o.status.toLowerCase(),
                time: o.createdAt
            })),
            ...recentServices.map(s => ({
                id: s._id,
                type: 'service',
                message: `Service ticket #${s.ticketId} — ${s.issueCategory}`,
                status: s.status === 'Open' ? 'warning' : 'assigned',
                time: s.createdAt
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);

        // ── Top Distributors by order value ─────────────────
        const topDistributors = await ProductOrder.aggregate([
            { $match: { orderType: 'distributor_to_admin', status: { $ne: 'Cancelled' } } },
            { $group: { _id: '$buyer', sales: { $sum: '$totalAmount' } } },
            { $sort: { sales: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            { $project: { name: '$user.businessName', sales: 1, _id: 0 } }
        ]);

        // ── Top Retailers by sales ───────────────────────────
        const topRetailers = await Sale.aggregate([
            { $group: { _id: '$retailer', sales: { $sum: '$totalAmount' } } },
            { $sort: { sales: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            { $project: { name: '$user.shopName', sales: 1, _id: 0 } }
        ]);

        return ApiResponse.success(res, {
            metrics: {
                todayRevenue,
                monthRevenue,
                totalOrders,
                todayOrders,
                activeDistributors,
                activeRetailers,
                totalCustomers,
                openServiceRequests,
                pendingTechnicians,
            },
            salesTrend,
            topDistributors,
            topRetailers,
            lowStockAlerts,
            pendingRequests,
            recentActivity,
        }, 'Dashboard data fetched');
    } catch (err) {
        next(err);
    }
};
