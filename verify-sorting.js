const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./src/models/Category');
const Mock = require('./src/models/Mock');
const ImportantQuestion = require('./src/models/ImportantQuestion');

async function verify() {
    console.log('Starting verification script...');
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        console.log('\n--- Categories ---');
        const categories = await Category.find().sort({ name: 1 });
        categories.forEach(c => console.log(c.name));
        const catNames = categories.map(c => c.name);
        const sortedCatNames = [...catNames].sort((a, b) => a.localeCompare(b));
        console.log('Is Categories Sorted?', JSON.stringify(catNames) === JSON.stringify(sortedCatNames));

        console.log('\n--- Mocks ---');
        const mocks = await Mock.find({ isActive: true }).sort({ title: 1 });
        mocks.forEach(m => console.log(m.title));
        const mockTitles = mocks.map(m => m.title);
        const sortedMockTitles = [...mockTitles].sort((a, b) => a.localeCompare(b));
        console.log('Is Mocks Sorted?', JSON.stringify(mockTitles) === JSON.stringify(sortedMockTitles));

        console.log('\n--- Important Questions ---');
        const questions = await ImportantQuestion.find().sort({ title: 1 });
        questions.forEach(q => console.log(q.title));
        const qTitles = questions.map(q => q.title);
        const sortedQTitles = [...qTitles].sort((a, b) => a.localeCompare(b));
        console.log('Is Important Questions Sorted?', JSON.stringify(qTitles) === JSON.stringify(sortedQTitles));

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
