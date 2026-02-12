const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' 
    },
    otp: {
        type: String,
        required: true
    },
    email: { 
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 
    }
}, { timestamps: true });


module.exports = mongoose.model('Otp', otpSchema);