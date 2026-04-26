const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
    name: String,
    serviceCategory: String, // e.g., 'Beauty and Spa', 'Cleaning'
    subServices: [String],
    rating: { type: Number, default: 5.0 }, // Editable by Admin
    isAvailable: { type: Boolean, default: true },
    currentLocation: {
        lat: Number,
        lng: Number
    }
});

module.exports = mongoose.model('Worker', workerSchema);
