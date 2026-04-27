const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const serviceConfigController = require('../controllers/admin.serviceConfig.controller');

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

// Public: service types for technician signup
router.get('/service-config', serviceConfigController.getServiceConfig);

module.exports = router;
