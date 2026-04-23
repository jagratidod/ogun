const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const ProductQuery = require('../src/models/productQuery.model');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        
        const count = await ProductQuery.countDocuments();
        console.log('Total Product Queries in DB:', count);
        
        if (count > 0) {
            const latest = await ProductQuery.findOne().sort('-createdAt').populate('product');
            console.log('Latest Query:', {
                id: latest.queryId,
                product: latest.product?.name,
                retailer: latest.retailer,
                distributor: latest.distributor,
                status: latest.status
            });
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err);
        process.exit(1);
    }
}

check();
