const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// --- MODELS ---
const Worker = require('../models/Worker');
const Booking = require('../models/Booking');
const User = require('../models/User');

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- AUTH ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "Account created successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role }, 'URBAN_SECRET_KEY', { expiresIn: '1d' });
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ADMIN ROUTES ---
app.post('/api/admin/add-worker', async (req, res) => {
    try {
        const newWorker = new Worker(req.body);
        await newWorker.save();
        res.status(201).json({ message: "Worker added successfully!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
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

// --- CUSTOMER ROUTES ---
app.get('/api/workers/category/:catName', async (req, res) => {
    try {
        const workers = await Worker.find({ category: req.params.catName, isAvailable: true });
        res.json(workers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/workers/nearby', async (req, res) => {
    const { lat, lng } = req.query;
    try {
        const nearbyWorkers = await Worker.find({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: 5000 
                }
            },
            isAvailable: true
        });
        res.json(nearbyWorkers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- WORKER ROUTES ---
app.get('/api/worker/bookings/:workerId', async (req, res) => {
    try {
        const tasks = await Booking.find({ workerId: req.params.workerId }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/worker/booking-status/:id', async (req, res) => {
    try {
        const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(updatedBooking);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- STATUS CHECK ---
app.get('/api/status', (req, res) => {
    res.json({ message: "URBANSERVICE backend is live!" });
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
