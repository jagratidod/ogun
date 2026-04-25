const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const hrRoutes = require('./hr.routes');
const distributorRoutes = require('./distributor.routes');
const retailerRoutes = require('./retailer.routes');
const customerRoutes = require('./customer.routes');
const salesExecutiveRoutes = require('./salesExecutive.routes');

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/hr', hrRoutes);
router.use('/distributor', distributorRoutes);
router.use('/retailer', retailerRoutes);
router.use('/customer', customerRoutes);
router.use('/sales-executive', salesExecutiveRoutes);

module.exports = router;
