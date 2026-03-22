const mongoose = require('mongoose');
require('dotenv').config();
const Mock = require('./src/models/Mock');

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const mocks = await Mock.find({ isActive: true }).sort({ title: 1 });
        console.log('Mocks from DB (sorted by title):');
        mocks.forEach(m => {
            console.log(`- "${m.title}" (ID: ${m._id})`);
        });
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
