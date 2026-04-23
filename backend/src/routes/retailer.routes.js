const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/apiResponse');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const retailerShipmentController = require('../controllers/retailer.shipment.controller');
const Inventory = require('../models/inventory.model');
const catchAsync = require('../utils/catchAsync');

router.get('/', (req, res) => {
    return ApiResponse.success(res, null, 'Retailer Module');
});

// Protect all retailer routes
router.use(protect);
router.use(restrictTo('retailer'));

// Inventory
router.get('/inventory', catchAsync(async (req, res) => {
    const inventory = await Inventory.find({ user: req.user._id }).populate('product');
    return ApiResponse.success(res, inventory, 'Inventory fetched');
}));

// Shipments
router.get('/shipments', retailerShipmentController.getIncomingShipments);
router.patch('/shipments/:id/receive', retailerShipmentController.receiveShipment);

// Distributor Marketplace
const retailerController = require('../controllers/retailer.controller');
router.get('/distributor-products', retailerController.getDistributorProducts);

module.exports = router;

