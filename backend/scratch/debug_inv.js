const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Inventory = require('../src/models/inventory.model');
const User = require('../src/models/user.model');

async function debugInventory() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const allInv = await Inventory.find().populate('user', 'email');
    console.log('--- ALL INVENTORY RECORDS ---');
    allInv.forEach(i => {
      console.log(`User: ${i.user?.email || 'Unknown'} | Qty: ${i.quantity} | Product: ${i.product}`);
    });

    const ogun = await User.findOne({ email: 'oguncrm@gmail.com' });
    const alerts = await Inventory.find({ user: ogun._id, quantity: { $lte: 100 } });
    console.log(`\nOgun CRM (${ogun._id}) has ${alerts.length} alerts.`);

    mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

debugInventory();
