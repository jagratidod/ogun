const mongoose = require('mongoose');
require('dotenv').config();
const Inventory = require('./backend/src/models/inventory.model');

async function updateThresholds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const result = await Inventory.updateMany(
      {},
      { $set: { minStockThreshold: 100 } }
    );
    
    console.log(`Updated ${result.modifiedCount} inventory records.`);
    process.exit(0);
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }
}

updateThresholds();
