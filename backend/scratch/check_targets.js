const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/user.model');

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const reps = await User.find({ role: 'sales_executive' }).select('name email salesExecutiveData');
    reps.forEach(r => {
        console.log(`\n${r.name} (${r.email})`);
        console.log('targets:', JSON.stringify(r.salesExecutiveData?.targets, null, 2));
    });
    process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
