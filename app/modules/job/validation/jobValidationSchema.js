const mongoose = require('mongoose');
const Joi = require('joi');

const isValidObjectId = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message('any.invalid');
    }
    return value;
};

const jobValidationSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(5)
        .max(150)
        .required()
        .messages({
            'string.base': 'Job title should be text.',
            'string.empty': 'Job title is required.',
            'string.min': 'Job title must be at least {#limit} characters long.',
            'string.max': 'Job title cannot exceed {#limit} characters.',
            'any.required': 'Job title is a required field.'
        }),

    description: Joi.string()
        .trim()
        .min(50)
        .required()
        .messages({
            'string.base': 'Job description should be text.',
            'string.empty': 'Job description is required.',
            'string.min': 'Job description must be at least {#limit} characters long.',
            'any.required': 'Job description is a required field.'
        }),

    location: Joi.array().items(Joi.string().custom(isValidObjectId, 'ObjectId validation')).min(1).required().messages({
        'array.min': 'At least one location is required',
        'any.required': 'Location is required',
        'array.base': 'Location must be an array of valid IDs.',
        'string.base': 'Each location ID must be a string.',
        'any.invalid': 'Invalid location ID(s) provided.'
    }),

    industry: Joi.string().custom(isValidObjectId, 'ObjectId validation').required().messages({
        'any.required': 'Industry is required',
        'any.invalid': 'Invalid industry ID'
    }),

    jobCategory: Joi.string().custom(isValidObjectId, 'ObjectId validation').required().messages({
        'any.required': 'Job category is required',
        'any.invalid': 'Invalid job category ID'
    }),

    jobType: Joi.string()
        .valid('full-time', 'part-time', 'contract', 'internship', 'temporary')
        .required()
        .messages({
            'string.base': 'Job type must be a string.',
            'any.only': 'Invalid job type selected',
            'any.required': 'Job type is required'
        }),

    workMode: Joi.string()
        .valid('work from office', 'work from home', 'hybrid', 'remote')
        .required()
        .messages({
            'string.base': 'Work mode must be a string.',
            'any.only': 'Invalid work mode selected',
            'any.required': 'Work mode is required'
        }),

    experienceLevel: Joi.string()
        .valid('fresher', 'entry-level', 'associate', 'mid-level',
            'senior', 'lead', 'manager', 'director', 'executive')
        .allow(null, '')
        .optional()
        .messages({
            'any.only': 'Invalid experience level',
        }),


    minimumExperience: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
            'number.base': 'Minimum experience must be a number.',
            'number.integer': 'Minimum experience must be an integer.',
            'number.min': 'Minimum experience years must be greater than or equal to 0',
            'any.required': 'Minimum experience is required.' 
        }),

    maximumExperience: Joi.number()
        .integer()
        .min(0)
        .allow(null)
        .optional()
        .messages({
            'number.base': 'Maximum experience must be a number.',
            'number.integer': 'Maximum experience must be an integer.',
            'any.required': 'Maximum experience is required.'
        }),


    minimumSalary: Joi.number().min(0).allow(null).optional()
        .messages({
            'number.base': 'Minimum salary must be a number',
            'number.min': 'Minimum salary must be greater than or equal to 0'
        }),

    maximumSalary: Joi.number().min(0).allow(null).optional()
        .messages({
            'number.base': 'Maximum salary must be a number',
            'number.min': 'Maximum salary must be greater than or equal to 0'
        }),

    skillsRequired: Joi.array().items(Joi.string().custom(isValidObjectId, 'ObjectId validation'))
        .min(1)
        .required()
        .messages({
            'array.min': 'At least one skill is required',
            'any.required': 'Skills are required',
            'array.base': 'Skills must be an array of valid IDs.',
            'string.base': 'Each skill ID must be a string.',
            'any.invalid': 'Invalid skill ID(s) provided.'
        }),

    applicationDeadline: Joi.date().iso().min('now').required().messages({
        'date.base': 'Application deadline must be a valid date',
        'date.iso': 'Application deadline must be a valid ISO 8601 date (e.g., YYYY-MM-DD)',
        'date.min': 'Application deadline must be in the future',
        'any.required': 'Application deadline is required.'
    }),

    vacancies: Joi.number().integer().min(1).allow(null).optional().messages({
        'number.base': 'Vacancies must be a number',
        'number.integer': 'Vacancies must be an integer.',
        'number.min': 'Vacancies must be greater than or equal to 1',
    }),

    company: Joi.string().custom(isValidObjectId, 'ObjectId validation').required().messages({
        'any.required': 'Company ID is required.',
        'any.invalid': 'Invalid company ID.'
    }),
    postedBy: Joi.string().custom(isValidObjectId, 'ObjectId validation').required().messages({
        'any.required': 'Recruiter ID is required.',
        'any.invalid': 'Invalid recruiter ID.'
    })
});

module.exports = { jobValidationSchema }