const ApiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.name}: ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    let { statusCode, message } = err;

    // Handle Mongoose Errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    } else if (err.code === 11000) {
        statusCode = 400;
        message = 'Duplicate field value entered';
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    if (!statusCode) {
        statusCode = 500;
        message = err.message || "Internal Server Error";
    }

    return ApiResponse.error(res, message, statusCode);
};

module.exports = errorHandler;
