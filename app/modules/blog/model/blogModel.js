const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    slug: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory', required: true },
    status: {
        type: String, enum: ['active', 'inactive'],
        default: 'active'
    }
}, { timestamps: true })

module.exports = mongoose.model('Blog', blogSchema);