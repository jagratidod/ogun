const User = require('../models/user.model');
const ProductOrder = require('../models/productOrder.model');
const Product = require('../models/product.model');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');
const { v4: uuidv4 } = require('uuid');

/**
 * @desc    Get Sales Executive Dashboard Stats
 * @route   GET /api/v1/sales-executive/stats
 */
exports.getStats = catchAsync(async (req, res) => {
    const retailers = await User.countDocuments({ role: 'retailer', onboardedBy: req.user._id });
    const orders = await ProductOrder.find({ createdBy: req.user._id });
    
    const totalSalesValue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;

    const stats = {
        totalRetailers: retailers,
        totalSalesValue,
        pendingOrders,
        rewardPoints: req.user.salesExecutiveData?.totalPoints || 0
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

    // Award points for onboarding (Optional/Configurable)
    if (req.user.salesExecutiveData) {
        req.user.salesExecutiveData.totalPoints += 50;
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

    // Award points for sale
    if (req.user.salesExecutiveData) {
        req.user.salesExecutiveData.totalPoints += Math.floor(totalAmount / 100); // 1 point per 100 spent
        await req.user.save();
    }

    return ApiResponse.success(res, order, 'Order placed successfully', 201);
});
