// Import the necessary packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Loads the variables from your .env file

// Initialize the Express application
const app = express();

// Middleware to parse JSON and allow cross-origin requests
app.use(express.json());
app.use(cors());

// The Connection Function
const connectDB = async () => {
    try {
        // Attempt to connect to MongoDB using the URI from the .env file
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Successfully connected to MongoDB Atlas!");
    } catch (error) {
        console.error("❌ Database connection error:", error.message);
        // Exit the process with failure if connection drops
        process.exit(1); 
    }
};

// Execute the connection
connectDB();

// A simple test route to ensure the server is responding
app.get('/api/status', (req, res) => {
    res.json({ message: "URBANSERVICE backend is live!" });
});

// Start the server
const PORT = process.env.PORT || 3000;
const Worker = require('./models/Worker');
const Booking = require('./models/Booking');

// ADMIN ROUTE: Add a new worker
app.post('/api/admin/add-worker', async (req, res) => {
    try {
        const newWorker = new Worker(req.body);
        await newWorker.save();
        res.status(201).json({ message: "Worker added successfully!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ADMIN ROUTE: Get all bookings to show on the dashboard
app.get('/api/admin/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().populate('workerId');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADMIN ROUTE: Update worker rating or availability
app.put('/api/admin/worker/:id', async (req, res) => {
    try {
        const updatedWorker = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedWorker);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
// CUSTOMER ROUTE: Get workers by category
app.get('/api/workers/category/:catName', async (req, res) => {
    try {
        // This looks in the database for workers matching the category clicked
        const workers = await Worker.find({ 
            category: req.params.catName,
            isAvailable: true 
        });
        res.json(workers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
