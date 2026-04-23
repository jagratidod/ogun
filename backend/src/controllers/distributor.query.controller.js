const ProductQuery = require('../models/productQuery.model');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Distributor gets queries from their retailers
 * @route   GET /api/v1/distributor/product-queries
 * @access  Private (Distributor)
 */
exports.getDistributorQueries = catchAsync(async (req, res, next) => {
    if (!req.user || !req.user._id) {
        return ApiResponse.error(res, 'Authentication required', 401);
    }
    
    const queries = await ProductQuery.find({ distributor: req.user._id })
        .populate('retailer', 'name shopName email phone')
        .populate('product', 'name sku images unit')
        .sort('-createdAt');

    return ApiResponse.success(res, queries, 'Retailer queries fetched');
});

/**
 * @desc    Distributor updates query status or adds note
 * @route   PATCH /api/v1/distributor/product-queries/:id/status
 * @access  Private (Distributor)
 */
exports.updateQueryStatus = catchAsync(async (req, res, next) => {
    const { status, distributorNote } = req.body;
    
    const query = await ProductQuery.findById(req.params.id);
    if (!query) {
        return ApiResponse.error(res, 'Query not found', 404);
    }

    // Verify ownership
    if (query.distributor.toString() !== req.user._id.toString()) {
        return ApiResponse.error(res, 'Unauthorized to update this query', 403);
    }

    if (status) query.status = status;
    if (distributorNote !== undefined) query.distributorNote = distributorNote;

    await query.save();

    return ApiResponse.success(res, query, 'Query updated successfully');
});
