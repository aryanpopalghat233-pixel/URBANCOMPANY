const mongoose = require('mongoose');

// models/Worker.js update
const workerSchema = new mongoose.Schema({
    name: String,
    category: String,
    isAvailable: { type: Boolean, default: true },
    // Use GeoJSON format for MongoDB geospatial queries
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    }
});

// This "index" tells MongoDB to treat this field like a map
workerSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Worker', workerSchema);
