const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- MODELS (Path Resolution for Linux/Render) ---
const Worker = require(path.resolve(__dirname, '../models/worker'));
const Booking = require(path.resolve(__dirname, '../models/booking'));
const User = require(path.resolve(__dirname, '../models/user'));

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// --- DATABASE ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- API ROUTES ---

// Add Worker (From Admin or Application Form)
app.post('/api/admin/add-worker', async (req, res) => {
    try {
        const newWorker = new Worker(req.body);
        await newWorker.save();
        res.status(201).json({ message: "Worker registered successfully!" });
    } catch (err) {
        console.error("Save Error:", err.message);
        res.status(400).json({ error: err.message });
    }
});

// Get Workers by Category
app.get('/api/workers/category/:catName', async (req, res) => {
    try {
        const workers = await Worker.find({ category: req.params.catName });
        res.json(workers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Catch-all to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
