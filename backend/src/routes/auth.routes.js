const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const serviceConfigController = require('../controllers/admin.serviceConfig.controller');
const { protect } = require('../middleware/auth.middleware');

// Public Routes
router.post('/register', authController.register);
router.post('/request-otp', authController.requestOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/admin/login', authController.adminLogin);
router.post('/technician/register', authController.registerTechnician);
router.post('/technician/login', authController.technicianLogin);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/distributors', authController.getDistributors);

// Protected Routes
router.patch('/preferences', protect, authController.updatePreferences);
router.get('/me', protect, (req, res) => {
    const ApiResponse = require('../utils/apiResponse');
    return ApiResponse.success(res, req.user, "User profile fetched");
});

// Public: service types for technician signup
router.get('/service-config', serviceConfigController.getServiceConfig);

module.exports = router;
