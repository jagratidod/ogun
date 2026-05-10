const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../src/models/product.model');
const Inventory = require('../src/models/inventory.model');
const User = require('../src/models/user.model');

async function syncAllAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find();
    const admins = await User.find({ role: 'admin' });

    console.log(`Syncing ${products.length} products for ${admins.length} admins...`);

    for (const admin of admins) {
      console.log(`Processing: ${admin.name} (${admin.email})`);
      for (const p of products) {
        const exists = await Inventory.findOne({ user: admin._id, product: p._id });
        if (!exists) {
          await Inventory.create({
            user: admin._id,
            product: p._id,
            quantity: Math.floor(Math.random() * 80) + 10 // Force low stock (10-90)
          });
        } else {
            // Update existing ones to be low stock too for testing
            exists.quantity = Math.floor(Math.random() * 80) + 10;
            await exists.save();
        }
      }
    }

    console.log('Sync complete. All admins now have low stock inventory.');
    mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

syncAllAdmins();
