const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hr.controller');
const { protect, restrictTo, checkPermission } = require('../middleware/auth.middleware');

// Protect all HR routes
router.use(protect);
router.use(restrictTo('admin'));

// Employee Management
router.get('/employees', checkPermission('hr'), hrController.getEmployees);

// Leave Management
router.get('/leaves', checkPermission('hr'), hrController.getAllLeaves);
router.patch('/leaves/:id/review', checkPermission('hr'), hrController.reviewLeave);

module.exports = router;
