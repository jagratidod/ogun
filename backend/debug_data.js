const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/Users/victus/Desktop/ogun/backend/.env' });
require('./src/models/user.model');
require('./src/models/product.model');
require('./src/models/inventory.model');
require('./src/models/productOrder.model');

const Inventory = mongoose.model('Inventory');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const inv = await Inventory.find().populate('user', 'name role').populate('product', 'name');
    console.log('--- ALL INVENTORY ---');
    console.log(JSON.stringify(inv, null, 2));
    
    const ProductOrder = mongoose.model('ProductOrder');
    const orders = await ProductOrder.find().populate('buyer', 'name role').populate('products.product', 'name');
    console.log('\n--- ALL ORDERS ---');
    console.log(JSON.stringify(orders, null, 2));
    
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
