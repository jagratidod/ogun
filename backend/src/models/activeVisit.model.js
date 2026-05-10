const mongoose = require('mongoose');

const activeVisitSchema = new mongoose.Schema({
    salesPerson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    retailer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    lastSeenAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// One active visit per salesperson at a time
activeVisitSchema.index({ salesPerson: 1 }, { unique: true });

const ActiveVisit = mongoose.model('ActiveVisit', activeVisitSchema);

module.exports = ActiveVisit;
