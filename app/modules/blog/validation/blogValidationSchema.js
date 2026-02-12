const Joi = require('joi');
const mongoose = require('mongoose');

const isValidObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message('any.invalid');
  }
  return value;
};

const blogValidationSchema = Joi.object({
  title: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Blog title is required',
      'any.required': 'Blog title is required'
    }),
  content: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Blog content is required',
      'any.required': 'Blog content is required'
    }),

  category: Joi.string().custom(isValidObjectId, 'ObjectId validation').required()
    .messages({
      'any.required': 'Blog category is required',
      'string.empty': 'Blog category is required',
      'any.invalid': 'Invalid Blog category ID'
    })
});

module.exports = { blogValidationSchema }