const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/apiResponse');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const distributorShipmentController = require('../controllers/distributor.shipment.controller');
const Inventory = require('../models/inventory.model');
const catchAsync = require('../utils/catchAsync');

router.get('/', (req, res) => {
    return ApiResponse.success(res, null, 'Distributor Module');
});

// Protect all distributor routes
router.use(protect);
router.use(restrictTo('distributor', 'admin'));

// Inventory Flow
router.get('/inventory', catchAsync(async (req, res) => {
    const inventory = await Inventory.find({ user: req.user._id }).populate('product');
    return ApiResponse.success(res, inventory, 'Inventory fetched successfully');
}));

// Shipment Flow
router.get('/shipments', distributorShipmentController.getReceivedShipments);
router.patch('/shipments/:id/receive', distributorShipmentController.receiveShipment);
router.post('/shipments/dispatch', distributorShipmentController.dispatchToRetailer);

// Ordering from Admin
const distributorOrderController = require('../controllers/distributor.order.controller');
router.get('/browse-products', distributorOrderController.getAvailableProducts);
router.post('/place-order', distributorOrderController.placeOrder);
router.get('/my-orders', distributorOrderController.getMyOrders);


// Retailer Management
const User = require('../models/user.model');
router.get('/retailers', catchAsync(async (req, res) => {
    // Show retailers belonging to this distributor
    const retailers = await User.find({ role: 'retailer', distributor: req.user._id })
        .select('name email businessName shopName location phone isActive createdAt');
    return ApiResponse.success(res, retailers, 'Retailers fetched successfully');
}));

router.post('/retailers', catchAsync(async (req, res) => {
    const { name, email, shopName, location, phone } = req.body;
    
    if (!name || !email || !shopName) {
        return ApiResponse.error(res, "Name, Email, and Shop Name are required", 400);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return ApiResponse.error(res, "A retailer with this email already exists", 400);
    }

    const retailer = await User.create({
        name,
        email,
        shopName,
        location,
        phone,
        role: 'retailer',
        distributor: req.user._id,
        isActive: true // Auto-approved when added by distributor
    });

    return ApiResponse.success(res, retailer, 'Retailer onboarded successfully.', 201);
}));

module.exports = router;


