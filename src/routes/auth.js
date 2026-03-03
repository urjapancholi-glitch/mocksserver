const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTP } = require('../utils/email');
// Removed config.js import

const router = express.Router();

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// 1. Admin Login (Static Credentials)
router.post('/admin/login', (req, res) => {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS) {
        const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.json({ token, user: { email, role: 'admin' } });
    }
    return res.status(401).json({ error: 'Invalid admin credentials' });
});

// 2. User Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and Password are required' });

    try {
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(401).json({ error: 'Invalid credentials or user not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user._id, name: user.name, email: user.email, roles: user.roles } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// 3. Request Registration OTP
router.post('/register/request-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    if (email === process.env.ADMIN_EMAIL) {
        return res.status(400).json({ error: 'Cannot register with admin email' });
    }

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'Email is already registered. Please login.' });
        }

        // Generate and save OTP to the temporary OTP collection
        const otpCode = generateOTP();

        // Upsert OTP for this email
        await OTP.findOneAndUpdate(
            { email },
            { code: otpCode, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        // Dispatch Email
        await sendOTP(email, otpCode);

        res.json({ message: 'OTP sent successfully to email' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error requesting OTP: ' + err.message });
    }
});

// 4. Verify OTP and Create User
router.post('/register/verify', async (req, res) => {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
        return res.status(400).json({ error: 'Name, Email, Password, and OTP are required' });
    }

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'User is already registered' });
        }

        // Verify OTP
        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord) {
            return res.status(400).json({ error: 'OTP expired or not requested' });
        }

        if (otpRecord.code !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // OTP is valid. Hash password and create User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            roles: ['user']
        });

        await newUser.save();

        // Delete the OTP record so it cannot be used again
        await OTP.deleteOne({ email });

        // Generate JWT
        const token = jwt.sign({ userId: newUser._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Registration successful',
            token,
            user: { id: newUser._id, name: newUser.name, email: newUser.email, roles: newUser.roles }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error verifying OTP: ' + err.message });
    }
});

// 5. GET /api/auth/admin/users - Get all users and their mock scores
router.get('/admin/users', async (req, res) => {
    try {
        const users = await User.find({ roles: 'user' })
            .populate('testsTaken.mockId', 'title')
            .select('-password -otp'); // exclude password and otp

        // ensure valid response even if mock was deleted
        const formattedUsers = users.map(user => {
            const userObj = user.toObject();
            userObj.testsTaken = userObj.testsTaken.map(test => {
                if (!test.mockId) {
                    test.mockId = { title: 'Unknown/Deleted Mock' };
                }
                return test;
            });
            return userObj;
        });

        res.json(formattedUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching users' });
    }
});

module.exports = router;
