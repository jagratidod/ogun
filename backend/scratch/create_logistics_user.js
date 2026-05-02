const mongoose = require('mongoose');
const User = require('../src/models/user.model');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const createLogisticsUser = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ogun');
        console.log('Connected.');

        const email = 'logistics@ogun.com';
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('User already exists. Updating subRole...');
            existingUser.subRole = 'logistics_manager';
            existingUser.permissions = ['inventory', 'orders', 'logistics', 'reports'];
            await existingUser.save();
            console.log('User updated successfully.');
        } else {
            console.log('Creating new logistics manager...');
            await User.create({
                name: 'Logistics Manager',
                email: email,
                password: 'password123', // Model will hash it
                role: 'admin',
                subRole: 'logistics_manager',
                permissions: ['inventory', 'orders', 'logistics', 'reports'],
                isActive: true
            });
            console.log('User created successfully.');
        }

        console.log('\n--- Credentials ---');
        console.log('Email: logistics@ogun.com');
        console.log('Password: password123');
        console.log('-------------------\n');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

createLogisticsUser();
