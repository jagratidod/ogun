const mongoose = require('mongoose');
const Inventory = require('../src/models/inventory.model');
const ProductOrder = require('../src/models/productOrder.model');
const User = require('../src/models/user.model');

const MONGO_URI = "mongodb+srv://oguncrm_db_user:oguncrm@cluster0.vreysfh.mongodb.net/ogun_crm?retryWrites=true&w=majority";

async function checkStock() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB (Atlas)');

    const orders = await ProductOrder.find({ status: 'Completed' }).populate('buyer', 'name role');
    console.log('\n--- COMPLETED ORDERS ---');
    orders.forEach(o => {
      console.log(`Order: ${o.orderId}, Buyer: ${o.buyer?.name} (${o.buyer?.role}), Items: ${o.products.length}`);
    });

    const inventory = await Inventory.find().populate('user', 'name role').populate('product', 'name');
    console.log('\n--- CURRENT INVENTORY ---');
    inventory.forEach(i => {
      console.log(`User: ${i.user?.name} (${i.user?.role}), Product: ${i.product?.name}, Qty: ${i.quantity}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkStock();
