const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/user.model');

async function listAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const admins = await User.find({ role: 'admin' });
    console.log('Admins in system:');
    admins.forEach(a => {
      console.log(`- ${a.name} (${a.email}) ID: ${a._id} SubRole: ${a.subRole}`);
    });
    mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

listAdmins();
