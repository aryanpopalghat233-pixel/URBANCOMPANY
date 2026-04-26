const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    category: { type: String, required: true },
    subServices: [String],
    rating: { type: Number, default: 4.8 },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true } // [lng, lat]
    }
});

workerSchema.index({ location: "2dsphere" });
module.exports = mongoose.model('Worker', workerSchema);
