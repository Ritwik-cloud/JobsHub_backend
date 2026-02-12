const mongoose = require('mongoose');

const jobCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    normalized: { type: String, required: true, unique: true },
}, { timestamps: true })

module.exports = mongoose.model('JobCategory', jobCategorySchema);