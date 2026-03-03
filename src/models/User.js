const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    roles: {
        type: [String],
        default: ['user'] // 'admin', 'user'
    },
    otp: {
        code: String,
        expiresAt: Date,
    },
    testsTaken: [
        {
            mockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mock' },
            score: Number,
            correct: Number,
            incorrect: Number,
            unanswered: Number,
            submittedAt: { type: Date, default: Date.now },
            answers: [
                {
                    questionId: String,
                    selectedOption: Number
                }
            ]
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('User', UserSchema);
