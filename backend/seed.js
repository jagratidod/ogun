const path = require('path');
// Load env explicitly from backend/.env regardless of where the process is started from.
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./src/modules/users/models/user.model');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB for seeding...');

        // Check if admin already exists
        const adminExists = await User.findOne({ email: 'admin@ogun.in' });

        if (adminExists) {
            console.log('Admin already exists. Skipping seed.');
        } else {
            await User.create({
                name: 'Super Admin',
                email: 'admin@ogun.in',
                password: 'admin123',
                role: 'admin',
                subRole: 'super_admin',
                permissions: ['all'],
                isActive: true
            });
            console.log('Super Admin created successfully!');
            console.log('Email: admin@ogun.in');
            console.log('Password: admin123');
        }

        // Optional: Seed a test distributor and retailer
        const distExists = await User.findOne({ email: 'dist@test.com' });
        if (!distExists) {
            await User.create({
                name: 'Test Distributor',
                email: 'dist@test.com',
                role: 'distributor',
                isActive: true
            });
            console.log('Test Distributor created (OTP: arjun@ogun.in style)');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
