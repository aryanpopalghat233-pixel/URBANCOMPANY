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
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. SIGNUP ROUTE
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // Scramble the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "Account created successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. LOGIN ROUTE
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Compare the entered password with the scrambled one in the DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Create a secure token that expires in 1 day
        const token = jwt.sign({ id: user._id, role: user.role }, 'URBAN_SECRET_KEY', { expiresIn: '1d' });

        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
