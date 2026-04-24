const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../src/models/user.model');

// Paste your sales_token from localStorage here
const TOKEN = process.argv[2];

if (!TOKEN) {
    console.log('Usage: node verify_token.js <sales_token_value>');
    process.exit(1);
}

async function verify() {
    await mongoose.connect(process.env.MONGODB_URI);
    try {
        const decoded = jwt.verify(TOKEN, process.env.JWT_ACCESS_SECRET);
        console.log('Decoded JWT:', decoded);
        const user = await User.findById(decoded.id).select('name email role salesExecutiveData');
        console.log('User from DB:', JSON.stringify(user, null, 2));
    } catch (e) {
        console.error('Token error:', e.message);
    }
    process.exit(0);
}
verify();
