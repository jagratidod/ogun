const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/user.model');

async function fix() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected\n');

    // Sales executives list
    const reps = await User.find({ role: 'sales_executive' }).select('name email _id');
    console.log('Sales Executives:');
    reps.forEach((r, i) => console.log(`  [${i}] ${r.name} | ${r.email} | ${r._id}`));

    // Retailer with wrong onboardedBy
    const retailer = await User.findById('69eb5edface0860022e7f540');
    console.log(`\nRetailer: ${retailer.name} (${retailer.email})`);
    console.log(`Current onboardedBy: ${retailer.onboardedBy}`);

    // Assign to correct sales rep — sales@ogun.in
    const correctRep = reps.find(r => r.email === 'sales@ogun.in');
    if (!correctRep) {
        console.log('\nRep not found. Update the email in this script to the correct one.');
        process.exit(1);
    }

    retailer.onboardedBy = correctRep._id;
    await retailer.save();
    console.log(`\nFixed! onboardedBy set to: ${correctRep.name} (${correctRep._id})`);

    process.exit(0);
}

fix().catch(e => { console.error(e); process.exit(1); });
