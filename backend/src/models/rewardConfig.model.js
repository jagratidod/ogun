const mongoose = require('mongoose');

const rewardConfigSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true, default: 'global' },
    earningRules: {
        retailer: {
            perProductSale: { type: Number, default: 10 },
            bulkBonus100Units: { type: Number, default: 500 },
            monthlyTargetBonus: { type: Number, default: 2000 },
            fastSellingBonus: { type: Number, default: 100 },
        },
        distributor: {
            perOrderDispatched: { type: Number, default: 20 },
            sameDayDeliveryBonus: { type: Number, default: 50 },
            bulkSupplyBonus: { type: Number, default: 200 },
            monthlyTargetBonus: { type: Number, default: 3000 },
        },
        salesExecutive: {
            perRetailerOnboarded: { type: Number, default: 50 },
            monthlySalesTargetBonus: { type: Number, default: 1000 },
            perOrderPlaced: { type: Number, default: 10 },
            retailerActivationBonus: { type: Number, default: 100 },
            perServiceResolved: { type: Number, default: 50 },
        },
    },
    systemConfig: {
        pointsEnabled: { type: Boolean, default: true },
        pointToRupeeRatio: { type: Number, default: 1 },
        pointsExpiryMonths: { type: Number, default: 6 },
    },
}, { timestamps: true });

module.exports = mongoose.model('RewardConfig', rewardConfigSchema);
