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
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
