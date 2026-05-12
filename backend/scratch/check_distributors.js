const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const User = require('../src/models/user.model');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        
        const distributors = await User.find({ role: 'distributor' }).lean();
        console.log('Total Distributors:', distributors.length);
        distributors.forEach(d => {
            console.log(`- ID: ${d._id}, Name: ${d.name}, Business: ${d.businessName}, Active: ${d.isActive}`);
        });
        
        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err);
        process.exit(1);
    }
}

check();
