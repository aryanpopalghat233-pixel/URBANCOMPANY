const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true }, // Ensure this matches 'phone' in your code
    category: { type: String, required: true },
    subServices: [String],
    rating: { type: Number, default: 4.5 },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true } // [Longitude, Latitude]
    }
});

// Important: This allows the "nearby" search to work
workerSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Worker', workerSchema);
