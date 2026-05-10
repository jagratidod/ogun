const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    salesPerson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD for easier querying
        required: true
    },
    appActiveTime: {
        type: Number, // In seconds
        default: 0
    },
    shopVisitTime: {
        type: Number, // In seconds
        default: 0
    },
    visits: [{
        retailer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        retailerName: String,
        startTime: Date,
        endTime: Date,
        duration: Number // In seconds
    }],
    lastHeartbeat: {
        type: Date,
        default: Date.now
    },
    isFinalized: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for fast lookups
attendanceSchema.index({ salesPerson: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
