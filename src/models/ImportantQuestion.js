const mongoose = require('mongoose');

const ImportantQuestionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ImportantQuestion', ImportantQuestionSchema);
