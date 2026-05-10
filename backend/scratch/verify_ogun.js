const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../src/models/product.model'); // Register Product model
const Inventory = require('../src/models/inventory.model');
const User = require('../src/models/user.model');

async function verifyOgunCrm() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: 'oguncrm@gmail.com' });
    if (!user) {
      console.log('User not found');
      process.exit();
    }

    const alerts = await Inventory.find({
      user: user._id,
      quantity: { $lte: 100 }
    }).populate('product');

    console.log(`Alerts for ${user.email}: ${alerts.length}`);
    alerts.forEach(a => {
      console.log(`- ${a.product?.name}: ${a.quantity}`);
    });

    mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

verifyOgunCrm();
