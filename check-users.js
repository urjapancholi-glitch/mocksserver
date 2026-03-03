const mongoose = require('mongoose');
const User = require('./src/models/User');
const config = require('./src/config');

async function checkRecentUsers() {
    await mongoose.connect(config.mongoURI);
    const users = await User.find().sort({ createdAt: -1 }).limit(3);
    console.log("Most recent users attempting login:");
    users.forEach(u => console.log(`- Email: ${u.email} | OTP: ${u.otp ? u.otp.code : 'None'} | Token Exp: ${u.otp ? u.otp.expiresAt : 'N/A'}`));
    process.exit(0);
}

checkRecentUsers();
