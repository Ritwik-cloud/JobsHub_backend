const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    // Basic Job Information
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company', 
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location', 
        required: true
    }],
    jobCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobCategory', 
        required: true
    },
    industry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Industry', 
        required: true
    },
    jobType: { 
        type: String,
        required: true,
        enum: ['full-time', 'part-time', 'contract', 'internship', 'temporary']
    },
    workMode: { 
        type: String,
        required: true,
        enum: ['work from office', 'work from home', 'hybrid', 'remote']
    },
    experienceLevel: { 
        type: String,
        enum: ['fresher', 'entry-level', 'associate', 'mid-level', 'senior', 'lead', 'manager', 'director', 'executive']
    },
    minimumExperience: { 
        type: Number,
        min: 0,
        required: true
    },
    maximumExperience: { 
        type: Number,
        min: 0,
    },

    minimumSalary: { type: Number, min: 0 },
    maximumSalary: { type: Number, min: 0 },

    skillsRequired: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill' 
    }],
    applicationDeadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    vacancies: { type: Number, default: 1 },
    isDeleted: { 
        type: Boolean,
        default: false
    }
}, {
    timestamps: true 
});


module.exports = mongoose.model('Job', jobSchema);