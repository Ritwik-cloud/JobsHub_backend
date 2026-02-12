const Joi = require('joi');
const mongoose = require('mongoose');

const isValidObjectId = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message('any.invalid');
    }
    return value;
};

const recruiterRegisterSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        'any.required': 'Name is required',
        'string.empty': 'Name is required',
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.empty': 'Email is required',
        'string.email': 'Invalid email format',
    }),
    designation:Joi.string().trim().required().messages({
        'any.required': 'Designation is required',
        'string.empty': 'Designation is required',
    }),
    password: Joi.string().min(6).required().messages({
        'any.required': 'Password is required',
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters',
    }),
    company: Joi.string().required().messages({
        'string.empty': 'Company name is required.',
        'any.required': 'Company name is required.'
    }),
     isNewCompany: Joi.boolean().required().messages({
        'any.required': 'New company flag is missing.',
        'boolean.base': 'New company flag must be true or false.'
    }),
    companyId: Joi.string().when('isNewCompany', {
        is: false, 
        then: Joi.string().required().custom(isValidObjectId, 'ObjectId validation').messages({ 
            'string.empty': 'Company ID is required for existing companies.',
            'string.pattern': 'Invalid company ID format.'
        }),
        otherwise: Joi.string().allow('').optional()
    }),
    website: Joi.string().uri().when('isNewCompany', {
        is: true,
        then: Joi.string().required().messages({
            'string.empty': 'Company website URL is required for new companies.',
            'string.uri': 'Please enter a valid URL for the company website.'
        }),
        otherwise: Joi.string().allow('').optional() 
    })
});

module.exports = { recruiterRegisterSchema }