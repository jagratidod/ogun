const express = require('express');
const router = express.Router();
const logisticsController = require('../controllers/logistics.controller');
const { protect, restrictTo, checkPermission } = require('../middleware/auth.middleware');

// All logistics routes are protected and restricted to admin role
router.use(protect);
router.use(restrictTo('admin'));

// Check for logistics permission (assigned to logistics_manager)
router.use(checkPermission('logistics'));

// Dashboard Stats
router.get('/stats', logisticsController.getDashboardStats);

// Shipments
router.get('/shipments', logisticsController.getAllShipments);
router.patch('/shipments/:id/status', logisticsController.updateShipmentStatus);
router.patch('/shipments/:id/assign', logisticsController.assignAgent);

// Orders
router.get('/orders', logisticsController.getOrderPipeline);
router.get('/restock', logisticsController.getRestockRequests);

// Analytics
router.get('/analytics', logisticsController.getAnalytics);

// Tracking (Specific detail)
router.get('/tracking/:id', logisticsController.getTrackingInfo);

// Agents
router.get('/agents', logisticsController.getDeliveryAgents);
router.post('/agents', logisticsController.createDeliveryAgent);

module.exports = router;
