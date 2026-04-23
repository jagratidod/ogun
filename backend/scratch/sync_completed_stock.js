const mongoose = require('mongoose');
const Inventory = require('../src/models/inventory.model');
const ProductOrder = require('../src/models/productOrder.model');
const Product = require('../src/models/product.model');
const User = require('../src/models/user.model');

const MONGO_URI = "mongodb+srv://oguncrm_db_user:oguncrm@cluster0.vreysfh.mongodb.net/ogun_crm?retryWrites=true&w=majority";

async function syncStock() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const completedOrders = await ProductOrder.find({ 
        status: 'Completed',
        stockAddedToBuyer: { $ne: true } // Only those not synced yet
    });

    console.log(`Found ${completedOrders.length} unsynced completed orders.`);

    for (const order of completedOrders) {
        console.log(`Syncing Order: ${order.orderId} for Buyer: ${order.buyer}`);
        
        for (const item of order.products) {
            let inv = await Inventory.findOne({ 
                user: order.buyer, 
                product: item.product 
            });

            if (inv) {
                inv.quantity += item.quantity;
                await inv.save();
                console.log(`Updated inventory for product ${item.product}. New Qty: ${inv.quantity}`);
            } else {
                await Inventory.create({
                    user: order.buyer,
                    product: item.product,
                    quantity: item.quantity
                });
                console.log(`Created new inventory record for product ${item.product}. Qty: ${item.quantity}`);
            }
        }
        
        order.stockAddedToBuyer = true;
        await order.save();
        console.log(`Order ${order.orderId} marked as synced.`);
    }

    console.log('Sync complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

syncStock();
