const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Inventory = require('../src/models/inventory.model');
const Product = require('../src/models/product.model');
const User = require('../src/models/user.model');

async function checkStock() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin user found');
      process.exit();
    }

    console.log(`Checking inventory for admin: ${admin.name} (${admin._id})`);

    const inventory = await Inventory.find({ user: admin._id }).populate('product');
    console.log(`Total inventory records: ${inventory.length}`);

    inventory.forEach(item => {
      console.log(`- ${item.product?.name || 'Unknown'}: ${item.quantity} (Threshold: 100)`);
    });

    const lowStock = inventory.filter(i => i.quantity <= 100);
    console.log(`\nLow stock items (<= 100): ${lowStock.length}`);

    mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkStock();
