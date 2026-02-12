const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    educationLevel: {
        type: String,
        required: true,
        enum: ['Diploma', 'Graduation', 'Post Graduation']
    }
}, { timestamps: true })

module.exports = mongoose.model('Course', courseSchema);