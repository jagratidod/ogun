const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/apiResponse');
const adminController = require('../controllers/admin.controller');
const { protect, restrictTo, checkPermission } = require('../middleware/auth.middleware');

router.get('/', (req, res) => {
    return ApiResponse.success(res, null, 'Admin Module');
});

// Protect all admin routes
router.use(protect);
router.use(restrictTo('admin'));

// Admin User Management Routes (Requires rbac permission or super_admin)
router.get('/users', checkPermission('rbac'), adminController.getUsers);
router.post('/users', checkPermission('rbac'), adminController.createUser);
router.put('/users/:id', checkPermission('rbac'), adminController.updateUser);
router.delete('/users/:id', checkPermission('rbac'), adminController.deleteUser);

// Partner Ops (permission-scoped, not full RBAC)
router.get('/distributors', checkPermission('distributors'), adminController.getDistributors);
router.put('/distributors/:id/status', checkPermission('distributors'), adminController.updateDistributorStatus);
router.get('/retailers', checkPermission('retailers'), adminController.getRetailers);
router.put('/retailers/:id/status', checkPermission('retailers'), adminController.updateRetailerStatus);
router.get('/customers', adminController.getCustomers);

// Reward Config
const rewardConfigController = require('../controllers/admin.rewardConfig.controller');
router.get('/reward-config', rewardConfigController.getConfig);
router.put('/reward-config/rules/:role', rewardConfigController.updateRules);

// Sales Representatives Management
const salesRepsController = require('../controllers/admin.salesReps.controller');
router.get('/sales-reps', salesRepsController.getSalesReps);
router.post('/sales-reps', salesRepsController.createSalesRep);
router.get('/sales-reps/:id', salesRepsController.getSalesRepDetail);
router.put('/sales-reps/:id', salesRepsController.updateSalesRep);
router.post('/sales-reps/:id/targets', salesRepsController.setTarget);

// Product Management
const productController = require('../controllers/admin.product.controller');
const upload = require('../middleware/upload.middleware');

router.post('/products', checkPermission('inventory'), upload.single('image'), productController.createProduct);
router.get('/products', checkPermission('inventory'), productController.getAllProducts);
router.get('/products/:id', checkPermission('inventory'), productController.getProductById);
router.put('/products/:id', checkPermission('inventory'), upload.single('image'), productController.updateProduct);
router.delete('/products/:id', checkPermission('inventory'), productController.deleteProduct);

router.get('/inventory', checkPermission('inventory'), productController.getAdminInventory);
router.get('/inventory/alerts', checkPermission('inventory'), productController.getLowStockAlerts);
router.get('/inventory/overview', checkPermission('inventory'), productController.getInventoryOverview);

// Category Management
const categoryController = require('../controllers/category.controller');
router.post('/categories', checkPermission('inventory'), categoryController.createCategory);
router.get('/categories', checkPermission('inventory'), categoryController.getAllCategories);
router.delete('/categories/:id', checkPermission('inventory'), categoryController.deleteCategory);

// Shipment Management
const adminShipmentController = require('../controllers/admin.shipment.controller');
router.post('/shipments', checkPermission('inventory'), adminShipmentController.createShipment);
router.get('/shipments', checkPermission('inventory'), adminShipmentController.getAdminShipments);

// Order Management
const adminOrderController = require('../controllers/admin.order.controller');
const adminQueryController = require('../controllers/admin.query.controller');
router.get('/orders', checkPermission('inventory'), adminOrderController.getAllOrders);
router.patch('/orders/:id/status', checkPermission('inventory'), adminOrderController.updateOrderStatus);

// Product Queries
router.get('/product-queries', checkPermission('inventory'), adminQueryController.getAllQueries);
router.patch('/product-queries/:id/status', checkPermission('inventory'), adminQueryController.updateQueryStatus);

module.exports = router;

