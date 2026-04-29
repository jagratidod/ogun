const path = require('path');
const http = require('http');
// Load env explicitly from backend/.env regardless of where the process is started from.
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');

const PORT = process.env.PORT || 5000;

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io
const io = initSocket(server);

// Attach io to app to make it accessible in controllers if needed (though we use getIO)
app.set('io', io);

// Connect to Database and start server
connectDB().then(() => {
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        console.log(`Real-time services (Socket.io) initialized`);
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Please kill the process or use a different port.`);
        } else {
            console.error('Server error:', error);
        }
    });
});
