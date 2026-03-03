const mongoose = require('mongoose');
const User = require('./src/models/User');
mongoose.connect('mongodb://127.0.0.1:27017/mock_platform').then(async () => {
    const users = await User.find({});
    console.log(users);
    process.exit(0);
});
