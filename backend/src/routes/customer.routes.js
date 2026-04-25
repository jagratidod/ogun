const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/apiResponse');
const customerController = require('../controllers/customer.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', (req, res) => {
    return ApiResponse.success(res, null, 'Customer Module');
});

// Protect all customer routes
router.use(protect);
router.use(restrictTo('customer'));

// ─── Product Registration ───
router.post('/products/register', upload.single('invoiceImage'), customerController.registerProduct);
router.get('/products', customerController.getMyProducts);
router.get('/products/:id', customerController.getProductDetail);

// ─── Warranty Extension ───
router.post('/products/:id/extend-warranty', customerController.extendWarranty);
router.get('/warranty-history', customerController.getWarrantyHistory);

// ─── Service Requests ───
router.post('/service-requests', customerController.raiseServiceRequest);
router.get('/service-requests', customerController.getMyServiceRequests);
router.get('/service-requests/:id', customerController.getServiceRequestDetail);

module.exports = router;
