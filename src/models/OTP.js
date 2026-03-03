const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    code: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Automatically delete document after 10 minutes (600 seconds)
    }
});

module.exports = mongoose.model('OTP', OTPSchema);
