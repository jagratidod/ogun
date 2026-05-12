const mongoose = require('mongoose');

const serviceTargetSchema = new mongoose.Schema({
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Assigned user is required']
    },
    serviceRole: {
        type: String,
        enum: ['head_of_service', 'regional_head', 'area_manager', 'service_supervisor', 'service_engineer'],
        required: [true, 'Service role is required']
    },
    period: {
        type: String,
        required: [true, 'Period is required']  // "2026-05"
    },
    periodType: {
        type: String,
        enum: ['monthly', 'quarterly'],
        default: 'monthly'
    },

    // Targets (set by admin)
    targets: {
        revenue:      { type: Number, default: 0 },   // INR
        csat:         { type: Number, default: 0 },   // % (0-100)
        tat:          { type: Number, default: 0 },   // hours
        ticketVolume: { type: Number, default: 0 },   // count
        jobCloseRate: { type: Number, default: 0 },   // %
        qualityScore: { type: Number, default: 0 },   // % (1-100)
        responseTime: { type: Number, default: 0 },   // minutes
    },

    // Actuals (computed by system cron)
    actuals: {
        revenue:      { type: Number, default: 0 },
        csat:         { type: Number, default: 0 },
        tat:          { type: Number, default: 0 },
        ticketVolume: { type: Number, default: 0 },
        jobCloseRate: { type: Number, default: 0 },
        qualityScore: { type: Number, default: 0 },
        responseTime: { type: Number, default: 0 },
    },

    status: {
        type: String,
        enum: ['Active', 'Completed', 'Expired'],
        default: 'Active'
    },
    lastComputedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

serviceTargetSchema.index({ assignedTo: 1, period: 1 }, { unique: true });
serviceTargetSchema.index({ serviceRole: 1, period: 1 });

const ServiceTarget = mongoose.model('ServiceTarget', serviceTargetSchema);

module.exports = ServiceTarget;
