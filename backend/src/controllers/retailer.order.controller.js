const ProductOrder = require('../models/productOrder.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const Inventory = require('../models/inventory.model');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Retailer places an order to their distributor
 * @route   POST /api/v1/retailer/orders
 * @access  Private (Retailer)
 */
exports.placeOrder = catchAsync(async (req, res, next) => {
    const { items, notes } = req.body;

    if (!items || items.length === 0) {
        return ApiResponse.error(res, 'No items in order', 400);
    }

    // 1. Get retailer and their assigned distributor
    const retailer = await User.findById(req.user._id).lean();
    if (!retailer.distributor) {
        return ApiResponse.error(res, 'No distributor assigned to you. Cannot place order.', 400);
    }

    let totalAmount = 0;
    const processedItems = [];

    // 2. Validate items and calculate total
    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
            return ApiResponse.error(res, `Product ${item.productId} not found`, 404);
        }

        // Retailers pay the retailerPrice set by Admin
        const itemPrice = product.retailerPrice;
        const itemTotal = itemPrice * item.quantity;
        totalAmount += itemTotal;

        processedItems.push({
            product: product._id,
            quantity: item.quantity,
            priceAtOrder: itemPrice
        });
    }

    // 3. Create order
    const orderId = `RET-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const order = await ProductOrder.create({
        orderId,
        buyer: req.user._id,
        seller: retailer.distributor,
        products: processedItems,
        totalAmount,
        notes,
        status: 'Pending',
        orderType: 'retailer_to_distributor'
    });

    // 4. Emit socket event (optional but good for real-time)
    try {
        const { getIO } = require('../config/socket');
        const io = getIO();
        if (io) {
            io.emit('new_retailer_order', {
                distributorId: retailer.distributor,
                orderId: order.orderId,
                retailerName: retailer.name
            });
        }
    } catch (err) {
        console.error('Socket emission failed:', err.message);
    }

    return ApiResponse.success(res, order, 'Order placed successfully to distributor', 201);
});

/**
 * @desc    Retailer gets their own orders
 * @route   GET /api/v1/retailer/orders
 * @access  Private (Retailer)
 */
exports.getMyOrders = catchAsync(async (req, res, next) => {
    const orders = await ProductOrder.find({ 
        buyer: req.user._id,
        orderType: 'retailer_to_distributor'
    })
    .populate('products.product', 'name sku images unit')
    .populate('seller', 'name shopName businessName')
    .sort('-createdAt');

    return ApiResponse.success(res, orders, 'Your orders fetched successfully');
});
