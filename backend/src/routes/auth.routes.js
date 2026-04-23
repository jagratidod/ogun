const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Public Routes
router.post('/register', authController.register);
router.post('/request-otp', authController.requestOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/admin/login', authController.adminLogin);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/distributors', authController.getDistributors);

module.exports = router;
