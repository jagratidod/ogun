const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const ProductQuery = require('../src/models/productQuery.model');
const User = require('../src/models/user.model');
const Product = require('../src/models/product.model');
const Inventory = require('../src/models/inventory.model');

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        
        // Simulate getMyQueries logic
        const testRetailer = await User.findOne({ role: 'retailer' }).lean();
        if (testRetailer) {
            console.log('Testing getMyQueries for:', testRetailer.name);
            const queries = await ProductQuery.find({ retailer: testRetailer._id })
                .populate('product', 'name sku images unit')
                .sort('-createdAt');
            console.log('Queries fetched:', queries.length);
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        console.error(err.stack);
        process.exit(1);
    }
}

test();
