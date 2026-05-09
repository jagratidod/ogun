const express = require('express');
const router = express.Router();
const logisticsController = require('../controllers/logistics.controller');
const { protect, restrictTo, checkPermission } = require('../middleware/auth.middleware');

// Public tracking lookup (No auth required)
router.get('/public/track/:identifier', logisticsController.getPublicTracking);

// All other logistics routes are protected and restricted to admin/logistics roles
router.use(protect);
router.use(restrictTo('admin'));
router.use(checkPermission('logistics'));

// Dashboard Stats
router.get('/stats', logisticsController.getDashboardStats);

// Shipments Lifecycle
router.post('/shipments', logisticsController.createShipmentFromOrder);
router.get('/shipments', logisticsController.getAllShipments);
router.patch('/shipments/:id/status', logisticsController.updateShipmentStatus);
router.patch('/shipments/:id/assign', logisticsController.assignAgent);
router.patch('/shipments/:id/packaging', logisticsController.addPackagingDetails);
router.patch('/shipments/:id/carrier', logisticsController.selectCarrier);
router.patch('/shipments/:id/dispatch', logisticsController.dispatchShipment);
router.post('/shipments/:id/tracking', logisticsController.addTrackingUpdate);
router.patch('/shipments/:id/deliver', logisticsController.confirmDelivery);

// Queues
router.get('/packaging-queue', logisticsController.getPackagingQueue);
router.get('/dispatch-queue', logisticsController.getDispatchQueue);

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
