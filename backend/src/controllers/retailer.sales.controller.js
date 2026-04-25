const Sale = require('../models/sale.model');
const Inventory = require('../models/inventory.model');
const Product = require('../models/product.model');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const { v4: uuidv4 } = require('uuid');

/**
 * @desc    Create a new sale (POS)
 * @route   POST /api/v1/retailer/sales
 * @access  Private (Retailer)
 */
exports.createSale = catchAsync(async (req, res, next) => {
    const { customer, items, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
        return ApiResponse.error(res, 'No items in sale', 400);
    }

    let totalAmount = 0;
    const processedItems = [];

    // 1. Validate items and check stock
    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) return ApiResponse.error(res, `Product ${item.product} not found`, 404);

        const inventory = await Inventory.findOne({ user: req.user._id, product: item.product });
        if (!inventory || inventory.quantity < item.quantity) {
            return ApiResponse.error(res, `Insufficient stock for ${product.name}. Available: ${inventory?.quantity || 0}`, 400);
        }

        const itemPrice = item.priceAtSale || product.retailerPrice;
        totalAmount += itemPrice * item.quantity;

        processedItems.push({
            product: item.product,
            quantity: item.quantity,
            priceAtSale: itemPrice
        });

        // 2. Deduct inventory
        inventory.quantity -= item.quantity;
        await inventory.save();
    }

    // 3. Create Sale record
    const sale = await Sale.create({
        saleId: `SALE-${uuidv4().substring(0, 8).toUpperCase()}`,
        retailer: req.user._id,
        customer,
        products: processedItems,
        totalAmount,
        paymentMethod,
        notes
    });

    // 4. Credit Reward Points
    const RewardService = require('../services/rewardService');
    for (const item of processedItems) {
        // We credit points per product sold using a multiplier for quantity
        await RewardService.creditPoints(
            req.user._id, 
            'retailer', 
            'perProductSale', 
            `Sale of ${item.quantity} units of product ${item.product} (ID: ${sale.saleId})`,
            item.quantity
        );
    }

    return ApiResponse.success(res, sale, 'Sale completed successfully', 201);
});

/**
 * @desc    Get sale history for retailer
 * @route   GET /api/v1/retailer/sales
 * @access  Private (Retailer)
 */
exports.getSaleHistory = catchAsync(async (req, res, next) => {
    const sales = await Sale.find({ retailer: req.user._id })
        .populate('products.product', 'name sku images')
        .sort('-createdAt');

    return ApiResponse.success(res, sales, 'Sale history fetched successfully');
});

/**
 * @desc    Get sale detail by ID
 * @route   GET /api/v1/retailer/sales/:id
 * @access  Private (Retailer)
 */
exports.getSaleDetail = catchAsync(async (req, res, next) => {
    const sale = await Sale.findOne({ _id: req.params.id, retailer: req.user._id })
        .populate('products.product')
        .populate('retailer', 'name shopName businessName phone email location');

    if (!sale) return ApiResponse.error(res, 'Sale not found', 404);

    return ApiResponse.success(res, sale, 'Sale details fetched');
});
