const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/apiResponse');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const retailerShipmentController = require('../controllers/retailer.shipment.controller');
const retailerController = require('../controllers/retailer.controller');
const retailerQueryController = require('../controllers/retailer.query.controller');
const Inventory = require('../models/inventory.model');
const catchAsync = require('../utils/catchAsync');

router.get('/', (req, res) => {
    return ApiResponse.success(res, null, 'Retailer Module');
});

// Protect all retailer routes
router.use(protect);
// Own Inventory
router.get('/inventory', restrictTo('retailer'), catchAsync(async (req, res) => {
    const inventory = await Inventory.find({ user: req.user._id }).populate('product');
    return ApiResponse.success(res, inventory, 'Inventory fetched');
}));

// Shipments
router.get('/shipments', restrictTo('retailer'), retailerShipmentController.getIncomingShipments);
router.patch('/shipments/:id/receive', restrictTo('retailer'), retailerShipmentController.receiveShipment);

// Admin Catalog (all admin products + distributor stock overlay)
router.get('/admin-catalog', restrictTo('retailer', 'distributor', 'admin'), retailerController.getAdminCatalog);

// Product Queries (Requests for unavailable products)
router.post('/product-queries', restrictTo('retailer', 'distributor'), retailerQueryController.createQuery);
router.get('/product-queries', restrictTo('retailer', 'distributor', 'admin'), retailerQueryController.getMyQueries);

// Legacy route — kept for backward compatibility
router.get('/distributor-products', retailerController.getDistributorProducts);

module.exports = router;
