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
    role: {
        type: String,
        enum: ['admin', 'distributor', 'retailer', 'customer'],
        required: true
    },
    subRole: {
        type: String, // super_admin, hr_manager, etc.
        default: null
    },
    permissions: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    distributor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    lastLogin: {
        type: Date
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
