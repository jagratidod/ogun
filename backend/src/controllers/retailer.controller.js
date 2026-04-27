const mongoose = require('mongoose');
const Inventory = require('../models/inventory.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const Sale = require('../models/sale.model');
const ProductOrder = require('../models/productOrder.model');

/**
 * @desc    Get dashboard statistics for retailer
 * @route   GET /api/v1/retailer/dashboard-stats
 * @access  Private (Retailer)
 */
exports.getDashboardStats = catchAsync(async (req, res, next) => {
    const retailerId = new mongoose.Types.ObjectId(req.user._id);

    // 1. KPI: Daily Sales (Today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const salesToday = await Sale.aggregate([
        { $match: { retailer: retailerId, createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);


    // 2. KPI: Store Network (Unique Customer Phones)
    const uniqueCustomers = await Sale.distinct('customer.phone', { retailer: retailerId });

    // 3. KPI: Inventory Value
    const inventory = await Inventory.find({ user: retailerId });
    const inventoryValue = inventory.reduce((acc, item) => acc + (item.quantity * (item.sellingPrice || 0)), 0);

    // 4. KPI: Reward Points (Corrected field name)
    const user = await User.findById(retailerId);
    const pointsBalance = user?.rewardPoints || 0;

    // 5. KPI: Pending Restock (Orders to Distributor)
    const pendingOrders = await ProductOrder.countDocuments({ 
        orderer: retailerId, 
        status: { $in: ['pending', 'confirmed'] } 
    });

    // 6. Sales Chart: Last 7 Days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    let salesHistory = [];
    try {
        salesHistory = await Sale.aggregate([
            { $match: { retailer: retailerId, createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: "$totalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);
    } catch (e) {
        console.error('Aggregation error (history):', e);
    }

    // Fill gaps in sales history
    const chartData = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const entry = salesHistory.find(s => s._id === dateStr);
        chartData.push({ day: dayName, sales: entry ? entry.total : 0 });
    }

    // 7. Recent Transactions (Latest 5)
    const recentSales = await Sale.find({ retailer: retailerId })
        .sort('-createdAt')
        .limit(5);

    // 8. Top Moving Products (Most sold)
    let topProducts = [];
    try {
        topProducts = await Sale.aggregate([
            { $match: { retailer: retailerId } },
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.product",
                    totalSold: { $sum: "$products.quantity" }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            }
        ]);
    } catch (e) {
        console.error('Aggregation error (top):', e);
    }

    const formattedTopProducts = topProducts.map(p => ({
        name: p.productDetails?.[0]?.name || 'Unknown Product',
        sales: p.totalSold,
        stock: inventory.find(i => i.product?.toString() === p._id.toString())?.quantity || 0
    }));

    return ApiResponse.success(res, {
        kpis: {
            dailySales: salesToday[0]?.total || 0,
            totalCustomers: uniqueCustomers.length,
            stockValue: inventoryValue,
            loyaltyPoints: pointsBalance,
            pendingRestock: pendingOrders
        },
        chartData,
        recentSales: recentSales.map(s => ({
            id: s.saleId,
            customer: s.customer?.name || 'Walk-in',
            amount: s.totalAmount,
            date: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })),
        topProducts: formattedTopProducts
    }, 'Dashboard stats fetched successfully');
});


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

        // 3.5 Build retailer's own inventory map
        let myInventoryMap = {};
        const myInventory = await Inventory.find({ user: req.user._id }).lean();
        myInventory.forEach(item => {
            if (item.product) {
                myInventoryMap[item.product.toString()] = item;
            }
        });

        // 4. Merge
        const enrichedProducts = allProducts.map(product => {
            const productIdStr = product._id.toString();
            const inventoryRecord = inventoryMap[productIdStr];
            const myRecord = myInventoryMap[productIdStr];

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
                mrp: product.mrp,
                description: product.description,
                unit: product.unit || 'units',
                available,
                distributorUnits,
                stockStatus,
                displayStock: `${distributorUnits} ${product.unit || 'units'}`,
                inMyStock: !!myRecord,
                mySellingPrice: myRecord ? myRecord.sellingPrice : 0,
                myQty: myRecord ? myRecord.quantity : 0
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

/**
 * @desc    Get retailer's own inventory
 * @route   GET /api/v1/retailer/inventory
 * @access  Private (Retailer)
 */
exports.getMyInventory = catchAsync(async (req, res, next) => {
    const inventory = await Inventory.find({ user: req.user._id }).populate('product');
    return ApiResponse.success(res, inventory, 'Inventory fetched successfully');
});

/**
 * @desc    Update an inventory item (selling price or threshold)
 * @route   PATCH /api/v1/retailer/inventory/:id
 * @access  Private (Retailer)
 */
exports.updateInventoryItem = catchAsync(async (req, res, next) => {
    const { sellingPrice, minStockThreshold } = req.body;
    
    const inventory = await Inventory.findOne({ 
        _id: req.params.id, 
        user: req.user._id 
    });

    if (!inventory) {
        return ApiResponse.error(res, 'Inventory item not found', 404);
    }

    if (sellingPrice !== undefined) inventory.sellingPrice = sellingPrice;
    if (minStockThreshold !== undefined) inventory.minStockThreshold = minStockThreshold;

    await inventory.save();

    return ApiResponse.success(res, inventory, 'Inventory updated successfully');
});
