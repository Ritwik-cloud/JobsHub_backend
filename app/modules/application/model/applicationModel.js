const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    status: { type: String, enum: ['applied', 'accepted', 'rejected'],default:'applied' },
    applicationDate: { type: Date, default: Date.now },
    resume: {
        path: { type: String },
        originalName: { type: String }
    }

},{timestamps:true});

applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });

module.exports=mongoose.model('Application',applicationSchema);