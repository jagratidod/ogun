const mongoose = require('mongoose');

const redemptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pointsRequested: {
        type: Number,
        required: true
    },
    cashValue: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'processed'],
        default: 'pending'
    },
    bankDetails: {
        bankName: String,
        accountNumber: String,
        ifscCode: String,
        accountHolder: String
    },
    adminNote: {
        type: String,
        default: null
    },
    processedAt: {
        type: Date
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Redemption', redemptionSchema);
