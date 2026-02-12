const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    slug:{ type: String, unique: true, required: true},
    website: { type: String},
    logo: { type: String },
    email:{ type: String},
    description:{type:String},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recruiters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User',required:true }],
    isActive: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('Company', companySchema)