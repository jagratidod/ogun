const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/user.model');
const RewardConfig = require('../src/models/rewardConfig.model');

async function fix() {
    await mongoose.connect(process.env.MONGODB_URI);

    // Get reward config
    const config = await RewardConfig.findOne({ key: 'global' });
    const rules = config?.earningRules?.salesExecutive;
    console.log('Reward rules:', JSON.stringify(rules, null, 2));

    const rep = await User.findOne({ email: 'sales@ogun.in' });
    console.log('Current points:', rep.salesExecutiveData?.totalPoints);

    // Count retailers onboarded by this rep
    const retailers = await User.find({ role: 'retailer', onboardedBy: rep._id });
    console.log('Retailers onboarded:', retailers.length);

    const perRetailer = rules?.perRetailerOnboarded || 40;
    const correctPoints = retailers.length * perRetailer;
    console.log(`Correct points should be: ${retailers.length} x ${perRetailer} = ${correctPoints}`);

    // Fix points
    rep.salesExecutiveData.totalPoints = correctPoints;
    rep.markModified('salesExecutiveData');
    await rep.save();
    console.log('Points updated to:', correctPoints);

    process.exit(0);
}

fix().catch(e => { console.error(e); process.exit(1); });
