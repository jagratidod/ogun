const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const errorHandler = require('./middleware/error.middleware');
const ApiResponse = require('./utils/apiResponse');

const app = express();

// Middlewares
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow media to load cross-origin
}));
app.use(cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Serve uploaded files (explore section images/videos) as static assets
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health Check
app.get('/health', (req, res) => {
    return ApiResponse.success(res, { uptime: process.uptime() }, 'Server is healthy');
});

// Import Unified Routes
const routes = require('./routes');

// Use Routes
app.use('/api/v1', routes);
app.use('/api', routes); // Fallback for calls without v1 prefix

// Error Handler
app.use(errorHandler);

module.exports = app;
 
