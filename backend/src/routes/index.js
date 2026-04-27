const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const hrRoutes = require('./hr.routes');
const distributorRoutes = require('./distributor.routes');
const retailerRoutes = require('./retailer.routes');
const customerRoutes = require('./customer.routes');
const salesExecutiveRoutes = require('./salesExecutive.routes');
const rewardRoutes = require('./reward.routes');
const redemptionRoutes = require('./redemption.routes');
const technicianRoutes = require('./technician.routes');

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/hr', hrRoutes);
router.use('/distributor', distributorRoutes);
router.use('/retailer', retailerRoutes);
router.use('/customer', customerRoutes);
router.use('/sales-executive', salesExecutiveRoutes);
router.use('/rewards', rewardRoutes);
router.use('/rewards/redemptions', redemptionRoutes);
router.use('/technician', technicianRoutes);

module.exports = router;
