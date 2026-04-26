const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customerId: String,
    workerId: String,
    serviceRequested: String,
    status: { type: String, default: 'Pending' }, // Pending, En Route, Completed
    customerLocation: {
        lat: Number,
        lng: Number
    },
    scheduledTime: Date
});

module.exports = mongoose.model('Booking', bookingSchema);
