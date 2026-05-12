const mongoose = require('mongoose');
const Shipment = require('../src/models/shipment.model');
const ProductOrder = require('../src/models/productOrder.model');
const dotenv = require('dotenv');

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const shipmentCount = await Shipment.countDocuments();
        const orderCount = await ProductOrder.countDocuments();
        const pendingShipments = await Shipment.countDocuments({ status: 'Pending', 'packages.0': { $exists: false } });

        console.log('--- Database Stats ---');
        console.log('Total Orders:', orderCount);
        console.log('Total Shipments:', shipmentCount);
        console.log('Shipments in Packaging Queue:', pendingShipments);

        if (shipmentCount === 0 && orderCount > 0) {
            console.log('\nSuggested Action: Create shipments from existing orders.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkData();
