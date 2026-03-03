const mongoose = require('mongoose');
const User = require('./src/models/User');
const Mock = require('./src/models/Mock');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://ipandey34846_db_user:QqicnoVyl6LlBtAH@cluster0.ljbm01n.mongodb.net/mock_platform?retryWrites=true&w=majority')
    .then(async () => {
        const users = await User.find({});
        for (const user of users) {
            console.log(`User: ${user.name}`);
            console.log(JSON.stringify(user.testsTaken, null, 2));
        }
        process.exit(0);
    }).catch(err => {
        console.error(err);
        process.exit(1);
    });
