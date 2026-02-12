const Joi = require('joi');

const portalSettingsValidationSchema = Joi.object({
    portalName: Joi.string()
        .required()
        .messages({
            'string.base': 'Portal Name must be a string.',
            'string.empty': 'Portal Name is required.',
            'any.required': 'Portal Name is required.'
        }),
    portalEmail: Joi.string()
        .email()
        .required()
        .messages({
            'string.base': 'Portal Email must be a string.',
            'string.email': 'Please provide a valid email address.',
            'string.empty': 'Portal Email is required.',
            'any.required': 'Portal Email is required.'
        }),
    contactNumber: Joi.string()
        .pattern(/^[0-9+\-()\s]{7,15}$/)
        .required()
        .messages({
            'string.base': 'Contact Number must be a string.',
            'string.empty': 'Contact Number is required.',
            'string.pattern.base': 'Please enter a valid contact number.',
            'any.required': 'Contact Number is required.'
        }),
    address: Joi.string()
        .required()
        .messages({
            'string.base': 'Address must be a string.',
            'string.empty': 'Address is required.',
            'any.required': 'Address is required.'
        }),
    aboutUs: Joi.string()
        .min(50)
        .max(500)
        .required()
        .messages({
            'string.base': 'About Us must be a string.',
            'string.empty': 'About Us is required.',
            'string.min': 'About Us must be at least 50 characters.',
            'string.max': 'About Us must not exceed 500 characters.',
            'any.required': 'About Us is required.'
        })
});

module.exports={portalSettingsValidationSchema}
