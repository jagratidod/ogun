const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/apiResponse');

router.get('/', (req, res) => {
    return ApiResponse.success(res, null, 'Customer Module');
});

module.exports = router;
