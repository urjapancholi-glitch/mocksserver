const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();
// Removed config.js import

const authRoutes = require('./routes/auth');
const mockRoutes = require('./routes/mock');

const app = express();

app.use(cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mock', mockRoutes);

app.get('/', (req, res) => {
    res.send('Mock Platform API running');
});

// Database connection
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI)
    .then(() => {
        console.log('MongoDB connected to', mongoURI);
        // We still listen for local development, but Vercel will simply export the app
        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    })
    .catch((err) => {
        console.error('Database connection error:', err);
        process.exit(1);
    });

module.exports = app;
