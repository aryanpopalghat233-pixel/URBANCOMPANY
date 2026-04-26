const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// --- 1. MODELS (Ensure your filenames in /models are lowercase) ---
const Worker = require('../models/worker');
const Booking = require('../models/booking');
const User = require('../models/user');

// --- 2. MIDDLEWARE ---
app.use(express.json()); // Essential to read form data
app.use(cors());         // Essential for frontend-backend communication
app.use(express.static(path.join(__dirname, '../public')));

// --- 3. DATABASE CONNECTION ---
// Make sure MONGO_URI is set in Render Environment Variables
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- 4. AUTHENTICATION ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "Account created!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id }, 'URBAN_SECRET', { expiresIn: '1d' });
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 5. WORKER & ADMIN ROUTES ---
// This handles the form from both admin.html and index.html
app.post('/api/admin/add-worker', async (req, res) => {
    try {
        console.log("📥 Incoming Worker Data:", req.body); // Check Render logs for this
        const newWorker = new Worker(req.body);
        await newWorker.save();
        res.status(201).json({ message: "Worker successfully added and is now live!" });
    } catch (err) {
        console.error("❌ Worker Save Error:", err.message);
        res.status(400).json({ error: err.message }); // Sends the specific missing field back to browser
    }
});

app.get('/api/admin/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().populate('workerId');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 6. CUSTOMER SEARCH ROUTES ---
app.get('/api/workers/category/:catName', async (req, res) => {
    try {
        const workers = await Worker.find({ 
            category: req.params.catName, 
            isAvailable: true 
        });
        res.json(workers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 7. WORKER PANEL ROUTES ---
app.get('/api/worker/bookings/:workerId', async (req, res) => {
    try {
        const tasks = await Booking.find({ workerId: req.params.workerId }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 8. GLOBAL ERROR HANDLING & START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 URBANSERVICE is live on port ${PORT}`);
});
