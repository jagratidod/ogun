const mongoose = require('mongoose');
require('dotenv').config();
const RewardConfig = require('./src/models/rewardConfig.model');

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        let config = await RewardConfig.findOne({ key: 'global' });
        if (!config) {
            console.log('No config found, creating new one...');
            config = new RewardConfig({ key: 'global' });
        }

        // Update Retailer Rules
        if (!config.earningRules.retailer.perOrderPlaced) {
            config.earningRules.retailer.perOrderPlaced = 10;
        }

        // Update Distributor Rules
        if (!config.earningRules.distributor.perOrderPlaced) {
            config.earningRules.distributor.perOrderPlaced = 10;
        }

        config.markModified('earningRules');
        await config.save();
        console.log('Migration successful: RewardConfig updated with perOrderPlaced');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
