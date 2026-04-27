const express = require('express');
const router = express.Router();
const redemptionController = require('../controllers/redemption.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/request', redemptionController.createRequest);
router.get('/my-requests', redemptionController.getMyRequests);

// Admin only routes
router.get('/admin/all', restrictTo('admin'), redemptionController.getAllRequests);
router.patch('/admin/:id', restrictTo('admin'), redemptionController.updateStatus);

module.exports = router;
