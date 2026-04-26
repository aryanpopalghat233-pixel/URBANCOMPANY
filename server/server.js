const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, '../public')));

// Connect to MongoDB Atlas (You will put your URI in a .env file)
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.log("Database connection error:", err));

// --- API ROUTES ---

// Example: Get all available workers for a specific service
app.get('/api/workers/:category', async (req, res) => {
    // In the future, this will fetch from the database
    res.json({ message: `Fetching workers for ${req.params.category}` });
});

// Example: Create a new booking
app.post('/api/bookings', async (req, res) => {
    // Logic to save booking to database will go here
    res.json({ message: "Booking created successfully!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
