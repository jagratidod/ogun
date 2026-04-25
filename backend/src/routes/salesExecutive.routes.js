const express = require('express');
const router = express.Router();
const salesExecutiveController = require('../controllers/salesExecutive.controller');
const productController = require('../controllers/admin.product.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const upload = require('../middleware/upload.middleware');

router.use(protect);
router.use(restrictTo('sales_executive'));

router.get('/stats', salesExecutiveController.getStats);
router.post('/retailers', salesExecutiveController.onboardRetailer);
router.get('/retailers', salesExecutiveController.getMyRetailers);
router.post('/orders', salesExecutiveController.placeOrder);
router.get('/products', productController.getAllProducts); // Catalog for terminal

// Leave Management
router.post('/leaves', salesExecutiveController.applyLeave);
router.get('/leaves', salesExecutiveController.getMyLeaves);

// Service Management (Technician Role)
router.get('/service-tickets', salesExecutiveController.getAssignedTickets);
router.patch('/service-tickets/:id/status', upload.array('resolutionImages', 5), salesExecutiveController.updateTicketStatus);

module.exports = router;
