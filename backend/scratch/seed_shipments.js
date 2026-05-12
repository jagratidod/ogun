const mongoose = require('mongoose');
const ProductOrder = require('../src/models/productOrder.model');
const Shipment = require('../src/models/shipment.model');
const TrackingLog = require('../src/models/trackingLog.model');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

dotenv.config();

const generatePODNumber = () => `POD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

const seedShipments = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const orders = await ProductOrder.find({ shipmentCreated: false }).limit(5);
        console.log(`Found ${orders.length} orders ready for shipment initialization.`);

        for (const order of orders) {
            const podNumber = generatePODNumber();
            const shipment = await Shipment.create({
                shipmentId: `SHP-${uuidv4().substring(0, 8).toUpperCase()}`,
                podNumber,
                sender: order.seller,
                recipient: order.buyer,
                products: order.products.map(p => ({ product: p.product, quantity: p.quantity })),
                direction: order.orderType === 'distributor_to_admin' ? 'admin_to_distributor' : 'distributor_to_retailer',
                status: 'Pending'
            });

            order.shipmentCreated = true;
            await order.save();

            await TrackingLog.create({
                shipment: shipment._id,
                podNumber,
                status: 'Shipment Created',
                location: 'System',
                remarks: 'Shipment auto-initialized for testing',
                updatedBy: order.seller // Using seller as a placeholder for updatedBy
            });

            console.log(`Created shipment ${shipment.shipmentId} for order ${order.orderId}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedShipments();
