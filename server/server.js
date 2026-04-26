const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// --- MODELS ---
// Using path.resolve ensures Render finds these files regardless of the folder depth
const Worker = require(path.resolve(__dirname, '../models/worker'));
const Booking = require(path.resolve(__dirname, '../models/booking'));
const User = require(path.resolve(__dirname, '../models/user'));

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// --- DATABASE ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// --- ROUTES ---
app.post('/api/admin/add-worker', async (req, res) => {
    try {
        const newWorker = new Worker(req.body);
        await newWorker.save();
        res.status(201).json({ message: "Worker added!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/workers/category/:catName', async (req, res) => {
    try {
        const workers = await Worker.find({ category: req.params.catName });
        res.json(workers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Root route to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server active on port ${PORT}`);
});
