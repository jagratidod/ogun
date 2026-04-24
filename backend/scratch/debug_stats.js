const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/user.model');

async function debug() {
    await mongoose.connect(process.env.MONGODB_URI);

    const rep = await User.findOne({ email: 'sales@ogun.in' }).select('_id name salesExecutiveData');
    console.log('Rep:', rep._id.toString(), rep.name);
    console.log('salesExecutiveData:', JSON.stringify(rep.salesExecutiveData, null, 2));

    const retailers = await User.find({ role: 'retailer', onboardedBy: rep._id }).select('name isActive onboardedBy');
    console.log('\nRetailers linked to this rep:', retailers.length);
    console.log(JSON.stringify(retailers, null, 2));

    process.exit(0);
}
debug().catch(e => { console.error(e); process.exit(1); });
