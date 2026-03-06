const mongoose = require('mongoose');

const MockSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    durationMinutes: {
        type: Number,
        required: true,
        default: 60
    },
    positiveMarks: {
        type: Number,
        required: true,
        default: 4
    },
    negativeMarks: {
        type: Number,
        required: true,
        default: 1
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    instructions: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    questions: [
        {
            text: { type: String, required: true },
            options: [
                { type: String, required: true }
            ],
            correctOptionIndex: { type: Number, required: true },
            explanation: { type: String, default: '' },
            positiveMarks: { type: Number },
            negativeMarks: { type: Number }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Mock', MockSchema);
