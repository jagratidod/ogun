const mongoose = require('mongoose');
const Shipment = require('../src/models/shipment.model');
const User = require('../src/models/user.model'); // Register User model
const dotenv = require('dotenv');

dotenv.config();

const checkShipmentLocations = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const shipments = await Shipment.find({ status: 'Pending', 'packages.0': { $exists: false } })
            .populate('recipient', 'name location');

        shipments.forEach(s => {
            console.log(`Shipment: ${s.shipmentId}, Recipient: ${s.recipient?.name}, Location: ${s.recipient?.location}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkShipmentLocations();
