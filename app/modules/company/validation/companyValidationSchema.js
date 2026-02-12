const Joi = require('joi');

const companyValidationSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        'any.required': 'Company name is required',
        'string.empty': 'Company name is required',
    }),

    email: Joi.string().email().allow('').messages({
        'string.email': 'Invalid email format',
    }),
    website: Joi.string().uri().trim().required().messages({
        'any.required': 'Company website is required',
        'string.empty': 'Company website is required',
        'string.uri': 'Website must be a valid URL',
    }),
    description: Joi.string().max(1000).allow('', null).messages({
        'string.base': 'Company description must be a string',
        'string.max': 'Company description can not exceed {#limit} characters'
    })
});

module.exports = { companyValidationSchema }