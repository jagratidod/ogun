const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/user.model');

async function debug() {
    await mongoose.connect(process.env.MONGODB_URI);

    const user = await User.findById('69e615c9e97145424e9ac2d3').select('name email role');
    console.log('onboardedBy user:', JSON.stringify(user, null, 2));

    process.exit(0);
}

debug().catch(e => { console.error(e); process.exit(1); });
