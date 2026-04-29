const express = require('express');
const router = express.Router();
const exploreController = require('../controllers/admin.explore.controller');

// Public route — no auth needed
// Returns only enabled items (for customers, retailers, distributors, sales)
router.get('/', exploreController.getAllExploreItems);

module.exports = router;
