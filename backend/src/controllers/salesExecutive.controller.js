const User = require('../models/user.model');
const ProductOrder = require('../models/productOrder.model');
const Product = require('../models/product.model');
const RewardConfig = require('../models/rewardConfig.model');
const Leave = require('../models/leave.model'); // Added Leave model
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');
const { v4: uuidv4 } = require('uuid');

// Helper: get sales executive earning rules from DB
const getSalesRules = async () => {
    const config = await RewardConfig.findOne({ key: 'global' });
    return config?.earningRules?.salesExecutive || {
        perRetailerOnboarded: 50,
        monthlySalesTargetBonus: 1000,
        perOrderPlaced: 10,
        retailerActivationBonus: 100,
    };
};

/**
 * @desc    Get Sales Executive Dashboard Stats
 * @route   GET /api/v1/sales-executive/stats
 */
exports.getStats = catchAsync(async (req, res) => {
    const freshUser = await User.findById(req.user._id);
    const retailers = await User.countDocuments({ role: 'retailer', onboardedBy: req.user._id });
    const orders = await ProductOrder.find({ createdBy: req.user._id });

    const totalSalesValue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;

    // Sync current month's achieved values into the target record
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const targets = freshUser.salesExecutiveData?.targets || [];
    const monthIdx = targets.findIndex(t => t.month === currentMonth);

    if (monthIdx >= 0) {
        targets[monthIdx].achievedRetailers = retailers;
        targets[monthIdx].achievedSales = totalSalesValue;
        freshUser.salesExecutiveData.targets = targets;
        freshUser.markModified('salesExecutiveData');
        await freshUser.save();
    }

    const stats = {
        totalRetailers: retailers,
        totalSalesValue,
        pendingOrders,
        rewardPoints: freshUser.salesExecutiveData?.totalPoints || 0,
        targets: freshUser.salesExecutiveData?.targets || [],
    };

    return ApiResponse.success(res, stats, 'Dashboard stats fetched');
});

/**
 * @desc    Onboard a new retailer
 * @route   POST /api/v1/sales-executive/retailers
 */
exports.onboardRetailer = catchAsync(async (req, res) => {
    const { name, email, shopName, location, phone, distributorId } = req.body;

    if (!name || !email || !shopName) {
        return ApiResponse.error(res, "Name, Email, and Shop Name are required", 400);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return ApiResponse.error(res, "A user with this email already exists", 400);
    }

    const retailer = await User.create({
        name,
        email,
        shopName,
        location,
        phone,
        role: 'retailer',
        distributor: distributorId || null,
        isActive: false, // Requires Admin approval
        onboardedBy: req.user._id
    });

    // Award points for onboarding using configured rules
    if (req.user.salesExecutiveData) {
        const rules = await getSalesRules();
        req.user.salesExecutiveData.totalPoints += rules.perRetailerOnboarded;
        await req.user.save();
    }

    return ApiResponse.success(res, retailer, 'Retailer onboarded successfully. Awaiting Admin approval.', 201);
});

/**
 * @desc    Get retailers onboarded by this executive
 * @route   GET /api/v1/sales-executive/retailers
 */
exports.getMyRetailers = catchAsync(async (req, res) => {
    const retailers = await User.find({ role: 'retailer', onboardedBy: req.user._id })
        .select('name email shopName location phone isActive createdAt');
    return ApiResponse.success(res, retailers, 'Retailers fetched');
});

/**
 * @desc    Place a new sale order for a retailer
 * @route   POST /api/v1/sales-executive/orders
 */
exports.placeOrder = catchAsync(async (req, res) => {
    const { retailerId, items, notes } = req.body;

    if (!retailerId || !items || items.length === 0) {
        return ApiResponse.error(res, "Retailer and products are required", 400);
    }

    const retailer = await User.findById(retailerId);
    if (!retailer || retailer.role !== 'retailer') {
        return ApiResponse.error(res, "Invalid retailer selected", 404);
    }

    let totalAmount = 0;
    const products = [];

    for (const item of items) {
        const prod = await Product.findById(item.productId);
        if (!prod) continue;

        const price = prod.retailerPrice || prod.price;
        totalAmount += price * item.quantity;

        products.push({
            product: item.productId,
            quantity: item.quantity,
            priceAtOrder: price
        });
    }

    const order = await ProductOrder.create({
        orderId: `ORD-SE-${uuidv4().substring(0, 8).toUpperCase()}`,
        buyer: retailerId,
        seller: req.user._id, // Sales Executive acts as the proxy seller
        sellerRole: 'sales_executive',
        products,
        totalAmount,
        status: 'Pending',
        notes,
        createdBy: req.user._id
    });

    // Award points for order using configured rules
    if (req.user.salesExecutiveData) {
        const rules = await getSalesRules();
        req.user.salesExecutiveData.totalPoints += rules.perOrderPlaced;
        await req.user.save();
    }

    return ApiResponse.success(res, order, 'Order placed successfully', 201);
});

// Leave Management for Sales Executive

/**
 * @desc    Apply for leave
 * @route   POST /api/v1/sales-executive/leaves
 */
exports.applyLeave = catchAsync(async (req, res) => {
    const { type, fromDate, toDate, reason } = req.body;

    if (!type || !fromDate || !toDate || !reason) {
        return ApiResponse.error(res, "All fields are required", 400);
    }

    const leave = await Leave.create({
        employee: req.user._id,
        type,
        fromDate,
        toDate,
        reason,
        status: 'pending'
    });

    return ApiResponse.success(res, leave, 'Leave request submitted successfully', 201);
});

/**
 * @desc    Get my leave history
 * @route   GET /api/v1/sales-executive/leaves
 */
exports.getMyLeaves = catchAsync(async (req, res) => {
    const leaves = await Leave.find({ employee: req.user._id }).sort({ createdAt: -1 });
    return ApiResponse.success(res, leaves, 'Leave history fetched');
});
