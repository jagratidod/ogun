const express = require('express');
const router = express.Router();
const salesExecutiveController = require('../controllers/salesExecutive.controller');
const productController = require('../controllers/admin.product.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

router.use(protect);
router.use(restrictTo('sales_executive'));

router.get('/stats', salesExecutiveController.getStats);
router.post('/retailers', salesExecutiveController.onboardRetailer);
router.get('/retailers', salesExecutiveController.getMyRetailers);
router.post('/orders', salesExecutiveController.placeOrder);
router.get('/products', productController.getAllProducts); // Catalog for terminal

module.exports = router;
