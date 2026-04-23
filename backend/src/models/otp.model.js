const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    code: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    verified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Auto-delete expired OTPs after 5 mins (handled by TTL index)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
