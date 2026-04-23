const Inventory = require('../models/inventory.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Get ALL Admin products, enriched with distributor's stock data
 *          - If distributor has the product → available: true, distributorUnits: N
 *          - If distributor doesn't have it  → available: false, distributorUnits: 0
 * @route   GET /api/v1/retailer/admin-catalog
 * @access  Private (Retailer)
 */
exports.getAdminCatalog = catchAsync(async (req, res, next) => {
    try {
        // 1. Get assigned distributor ID from retailer's profile
        const retailer = await User.findById(req.user._id).lean();
        const distributorId = retailer?.distributor;
        
        if (!distributorId) {
            console.log(`[CATALOG] No distributor assigned for retailer ${req.user._id}`);
            // Return all products as unavailable
            const allProducts = await Product.find({ status: 'active' }).sort('-createdAt').lean();
            const simplified = allProducts.map(p => ({
                id: p._id,
                name: p.name,
                sku: p.sku,
                category: p.category,
                images: p.images,
                retailerPrice: p.retailerPrice,
                description: p.description,
                unit: p.unit || 'units',
                available: false,
                distributorUnits: 0,
                stockStatus: 'Unavailable',
                displayStock: `0 ${p.unit || 'units'}`
            }));
            return ApiResponse.success(res, simplified, 'Catalog fetched (No distributor assigned)');
        }

        // 2. Fetch ALL products from Admin catalog
        const allProducts = await Product.find({ status: 'active' }).sort('-createdAt').lean();

        // 3. Build distributor inventory map
        let inventoryMap = {};
        const distributorInventory = await Inventory.find({ user: distributorId }).lean();
        distributorInventory.forEach(item => {
            if (item.product) {
                inventoryMap[item.product.toString()] = item;
            }
        });

        // 4. Merge
        const enrichedProducts = allProducts.map(product => {
            const productIdStr = product._id.toString();
            const inventoryRecord = inventoryMap[productIdStr];

            const distributorUnits = inventoryRecord ? (inventoryRecord.quantity || 0) : 0;
            const available = distributorUnits > 0;

            let stockStatus = 'Unavailable';
            if (inventoryRecord) {
                if (distributorUnits === 0) stockStatus = 'Out of Stock';
                else if (distributorUnits <= (inventoryRecord.minStockThreshold || 100)) stockStatus = 'Low Stock';
                else stockStatus = 'In Stock';
            }

            return {
                id: product._id,
                name: product.name,
                sku: product.sku,
                category: product.category,
                images: product.images,
                retailerPrice: product.retailerPrice,
                description: product.description,
                unit: product.unit || 'units',
                available,
                distributorUnits,
                stockStatus,
                displayStock: `${distributorUnits} ${product.unit || 'units'}`
            };
        });

        return ApiResponse.success(res, enrichedProducts, 'Admin catalog fetched successfully');
    } catch (err) {
        console.error('[CATALOG ERROR]', err);
        return next(err);
    }
});

/**
 * @desc    Get all products from the assigned Distributor's inventory (legacy — kept for compat)
 * @route   GET /api/v1/retailer/distributor-products  [DEPRECATED — use /admin-catalog]
 * @access  Private (Retailer)
 */
exports.getDistributorProducts = catchAsync(async (req, res, next) => {
    const retailer = await User.findById(req.user._id);

    if (!retailer.distributor) {
        return ApiResponse.success(res, [], 'No distributor assigned to this retailer');
    }

    const inventory = await Inventory.find({ user: retailer.distributor })
        .populate('product')
        .sort('-updatedAt');

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
