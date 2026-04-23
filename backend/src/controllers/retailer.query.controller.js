const ProductQuery = require('../models/productQuery.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Retailer raises a query for an unavailable product
 * @route   POST /api/v1/retailer/product-queries
 * @access  Private (Retailer)
 */
exports.createQuery = async (req, res, next) => {
    try {
        const { productId, requestedQuantity, message } = req.body;
        console.log(`[CONTROLLER] createQuery request received for product: ${productId}`);

        // 1. Validate product
        const product = await Product.findById(productId);
        if (!product) {
            return ApiResponse.error(res, 'Product not found', 404);
        }

        // 2. Determine involved parties based on role
        const user = await User.findById(req.user._id).lean();
        let distributorId;
        let retailerId = null;

        if (user.role === 'retailer') {
            if (!user.distributor) {
                return ApiResponse.error(res, 'No distributor assigned to you. Cannot raise query.', 400);
            }
            distributorId = user.distributor;
            retailerId = user._id;
        } else if (user.role === 'distributor') {
            distributorId = user._id; // Distributor asking Admin directly
        } else {
            return ApiResponse.error(res, 'Only retailers and distributors can raise product queries.', 403);
        }

        // 3. Create query
        const queryId = `QRY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        
        const query = await ProductQuery.create({
            queryId,
            retailer: retailerId,
            distributor: distributorId,
            product: productId,
            requestedQuantity: requestedQuantity || 1,
            message: message || ''
        });

        console.log(`[CONTROLLER] Query created successfully in DB: ${query._id}`);
        return ApiResponse.success(res, query, 'Product query submitted successfully', 201);
    } catch (error) {
        console.error('[CONTROLLER ERROR] createQuery:', error);
        next(error);
    }
};

/**
 * @desc    Retailer gets their own product queries
 * @route   GET /api/v1/retailer/product-queries
 * @access  Private (Retailer)
 */
exports.getMyQueries = async (req, res, next) => {
    try {
        if (!req.user || !req.user._id) {
            return ApiResponse.error(res, 'Authentication required', 401);
        }

        const queries = await ProductQuery.find({ 
            $or: [
                { retailer: req.user._id },
                { distributor: req.user._id, retailer: null }
            ]
        })
        .populate('product', 'name sku images unit')
        .sort('-createdAt');

        return ApiResponse.success(res, queries, 'My product queries fetched');
    } catch (error) {
        console.error('[CONTROLLER ERROR] getMyQueries:', error);
        next(error);
    }
};
