const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../src/models/product.model');
const Inventory = require('../src/models/inventory.model');
const User = require('../src/models/user.model');

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find();
    console.log(`Total products: ${products.length}`);

    const admin = await User.findOne({ role: 'admin' });
    
    if (products.length > 0 && admin) {
        console.log('Syncing products to inventory for admin...');
        for (const p of products) {
            const exists = await Inventory.findOne({ user: admin._id, product: p._id });
            if (!exists) {
                await Inventory.create({
                    user: admin._id,
                    product: p._id,
                    quantity: Math.floor(Math.random() * 200) // Mock some stock
                });
                console.log(`Created inventory for ${p.name}`);
            }
        }
    }

    mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkProducts();
