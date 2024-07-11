const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    name: String,
    course: String,
    date: String,
    email: String,
    pdfLink: String
});

module.exports = mongoose.model('Certificate', certificateSchema);
