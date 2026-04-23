const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const errorHandler = require('./middleware/error.middleware');
const ApiResponse = require('./utils/apiResponse');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Health Check
app.get('/health', (req, res) => {
    return ApiResponse.success(res, { uptime: process.uptime() }, 'Server is healthy');
});

// Import Unified Routes
const routes = require('./routes');

// Use Routes
app.use('/api/v1', routes);

// Error Handler
app.use(errorHandler);

module.exports = app;
