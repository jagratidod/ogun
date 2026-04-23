const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const User = require('../src/models/user.model');

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        
        const ProductQuery = require('../src/models/productQuery.model');
        const distributor = await User.findOne({ role: 'distributor' }).lean();
        if (distributor) {
            console.log('Testing Distributor Query Fetch for:', distributor.name);
            const queries = await ProductQuery.find({ distributor: distributor._id })
                .populate('retailer', 'name shopName email phone')
                .populate('product', 'name sku images unit')
                .sort('-createdAt');
            console.log('Queries found for distributor:', queries.length);
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

test();
