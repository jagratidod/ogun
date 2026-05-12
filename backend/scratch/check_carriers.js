const mongoose = require('mongoose');
const Carrier = require('../src/models/carrier.model');
const dotenv = require('dotenv');

dotenv.config();

const checkCarriers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const carrierCount = await Carrier.countDocuments();
        const activeCarriers = await Carrier.find({ isActive: true });

        console.log('Total Carriers:', carrierCount);
        console.log('Active Carriers:', activeCarriers.length);

        if (activeCarriers.length > 0) {
            activeCarriers.forEach(c => {
                console.log(`Carrier: ${c.name}, Zones: ${c.pricingZones.map(z => z.zone).join(', ')}`);
            });
        } else {
            console.log('No active carriers found. Seeding dummy carriers...');
            // Seed a few dummy carriers
            await Carrier.create([
                {
                    name: 'Delhivery Express',
                    type: 'courier',
                    deliverySLA: 4,
                    pricingZones: [
                        { zone: 'North', basePrice: 50, pricePerKg: 10 },
                        { zone: 'South', basePrice: 100, pricePerKg: 15 },
                        { zone: 'East', basePrice: 120, pricePerKg: 18 },
                        { zone: 'West', basePrice: 80, pricePerKg: 12 }
                    ],
                    trackingUrl: 'https://www.delhivery.com/track/package/',
                    isActive: true
                },
                {
                    name: 'BlueDart Air',
                    type: 'courier',
                    deliverySLA: 2,
                    pricingZones: [
                        { zone: 'North', basePrice: 200, pricePerKg: 40 },
                        { zone: 'South', basePrice: 350, pricePerKg: 60 },
                        { zone: 'East', basePrice: 400, pricePerKg: 70 },
                        { zone: 'West', basePrice: 300, pricePerKg: 50 }
                    ],
                    trackingUrl: 'https://www.bluedart.com/tracking',
                    isActive: true
                }
            ]);
            console.log('Dummy carriers seeded.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkCarriers();
