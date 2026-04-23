const ProductQuery = require('../models/productQuery.model');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Admin gets ALL product queries
 * @route   GET /api/v1/admin/product-queries
 * @access  Private (Admin)
 */
exports.getAllQueries = catchAsync(async (req, res, next) => {
    const queries = await ProductQuery.find()
        .populate('retailer', 'name shopName businessName email')
        .populate('distributor', 'name businessName')
        .populate('product', 'name sku images unit')
        .sort('-createdAt');

    const stats = {
        total: queries.length,
        pending: queries.filter(q => q.status === 'Pending').length,
        processing: queries.filter(q => q.status === 'Processing').length,
        fulfilled: queries.filter(q => q.status === 'Fulfilled').length
    };

    return ApiResponse.success(res, { queries, stats }, 'All product queries fetched');
});

/**
 * @desc    Admin updates query status or adds note
 * @route   PATCH /api/v1/admin/product-queries/:id/status
 * @access  Private (Admin)
 */
exports.updateQueryStatus = catchAsync(async (req, res, next) => {
    const { status, adminNote } = req.body;
    
    const query = await ProductQuery.findById(req.params.id);
    if (!query) {
        return ApiResponse.error(res, 'Query not found', 404);
    }

    if (status) query.status = status;
    if (adminNote !== undefined) query.adminNote = adminNote;

    await query.save();

    return ApiResponse.success(res, query, 'Query updated successfully');
});
