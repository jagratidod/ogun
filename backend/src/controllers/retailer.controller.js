const Inventory = require('../models/inventory.model');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Get all products from the assigned Distributor's inventory
 * @route   GET /api/v1/retailer/distributor-products
 * @access  Private (Retailer)
 */
exports.getDistributorProducts = catchAsync(async (req, res, next) => {
    // 1. Find current retailer's distributor ID
    const retailer = await User.findById(req.user._id);
    
    if (!retailer.distributor) {
        return ApiResponse.success(res, [], 'No distributor assigned to this retailer');
    }

    // 2. Fetch inventory of that distributor
    const inventory = await Inventory.find({ user: retailer.distributor })
        .populate('product')
        .sort('-updatedAt');

    // 3. Map to a cleaner format for the retailer to browse
    const products = inventory.map(item => ({
        id: item.product?._id,
        inventoryId: item._id,
        name: item.product?.name,
        sku: item.product?.sku,
        category: item.product?.category,
        images: item.product?.images,
        availableStock: item.quantity,
        retailerPrice: item.product?.retailerPrice,
        status: item.status,
        description: item.product?.description
    }));

    return ApiResponse.success(res, products, 'Distributor products fetched successfully');
});
