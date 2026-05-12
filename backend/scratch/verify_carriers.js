const mongoose = require('mongoose');
const Carrier = require('../src/models/carrier.model');
const dotenv = require('dotenv');

dotenv.config();

const verifyCarriers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const carriers = await Carrier.find({ isActive: true });
        console.log(`Found ${carriers.length} active carriers.`);

        carriers.forEach(c => {
            console.log(`Carrier: ${c.name}`);
            console.log(`Zones: ${JSON.stringify(c.pricingZones)}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyCarriers();
