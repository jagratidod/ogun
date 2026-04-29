const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        select: false // Only for Admin/Staff
    },
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    // Partner metadata (optional)
    businessName: {
        type: String,
        default: null,
        trim: true
    },
    shopName: {
        type: String,
        default: null,
        trim: true
    },
    location: {
        type: String,
        default: null,
        trim: true
    },
    phone: {
        type: String,
        default: null,
        trim: true
    },
    // Technician service specializations
    services: [{
        type: String,
        trim: true
    }],
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved'
    },
    approvalNote: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['admin', 'distributor', 'retailer', 'customer', 'sales_executive'],
        required: true
    },
    subRole: {
        type: String, // super_admin, hr_manager, etc.
        default: null
    },
    // Sales Executive specific data
    salesExecutiveData: {
        assignedArea: String,
        totalPoints: { type: Number, default: 0 },
        targets: [{
            month: String, // e.g., "2026-04"
            salesTarget: { type: Number, default: 0 },
            retailersTarget: { type: Number, default: 0 },
            achievedSales: { type: Number, default: 0 },
            achievedRetailers: { type: Number, default: 0 }
        }]
    },
    permissions: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    // Payroll fields (HR-managed)
    salary: {
        type: Number,
        default: 0
    },
    department: {
        type: String,
        default: null,
        trim: true
    },
    bankDetails: {
        bankName: { type: String, default: null },
        accountNumber: { type: String, default: null },
        ifscCode: { type: String, default: null },
        accountHolder: { type: String, default: null }
    },
    distributor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    onboardedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    lastLogin: {
        type: Date
    },
    // Rewards System
    rewardPoints: {
        type: Number,
        default: 0
    },
    pointHistory: [{
        amount: { type: Number, required: true },
        reason: { type: String, required: true }, // e.g., "Product Sale Bonus", "Target Achievement"
        type: { type: String, enum: ['credit', 'debit'], default: 'credit' },
        timestamp: { type: Date, default: Date.now }
    }],
    preferences: {
        theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
        compactMode: { type: Boolean, default: false },
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            push: { type: Boolean, default: true }
        }
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.password || !this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
