const Joi = require('joi');
// const courseRepositories = require('../modules/predefined_data/repositories/courseRepositories');
const mongoose = require('mongoose');
const specializationRepositories = require('../modules/predefined_data/repositories/specializationRepositories');

const isValidObjectId = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message('any.invalid');
    }
    return value;
};

class SpecializationController {

    async addSpecialization(req, res) {
        try {
            const specializationValidation = Joi.object({
                name: Joi.string().trim().required().messages({
                    'string.empty': 'Course name is required.',
                    'any.required': 'Course name is required.'
                }),
                course: Joi.string().required().custom(isValidObjectId, 'ObjectId validation')
                    .messages({
                        'any.required': 'Course is required.',
                        'string.empty': 'Course is required.',
                        'any.invalid': 'Invalid Course ID.'
                    }),
            })

            const { error, value } = specializationValidation.validate(req.body, { abortEarly: false });
            if (error) {
                console.log(error);
                const errors = {};
                error.details.forEach(err => {
                    errors[err.path[0]] = err.message;
                });
                return res.status(400).json({
                    status: false,
                    errors
                });
            }

            const { name, course } = value;

            const specializationPrsent = await specializationRepositories.findSpecializationBynameAndCourse(name, course);

            if (specializationPrsent) {
                return res.status(400).json({
                    status: false,
                    errors: { name: 'This specialization name is already present for this course.' }
                });
            }

            const newSpecialization = await specializationRepositories.addSpecialization({ name, course });

            return res.status(201).json({
                status: true,
                message: 'Specialization name is saved.',
                data: newSpecialization
            });


        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getAllSpecializations(req, res) {
        try {
            const specializations = await specializationRepositories.getAllSpecializations();
            return res.status(200).json({
                status: true,
                message: 'Courses fetched successfully.',
                data: specializations
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getSpecialization(req, res) {
        try {
            const specialization = await specializationRepositories.getSpecializationById(req.params.id);
            if (!specialization) {
                return res.status(404).json({
                    status: false,
                    message: 'Specialization is not found.'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Specialization has been fetched successfully',
                data: specialization
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async updateSpecialization(req, res) {
        try {
            const specializationValidation = Joi.object({
                name: Joi.string().trim().required().messages({
                    'string.empty': 'Course name is required.',
                    'any.required': 'Course name is required.'
                }),
                course: Joi.string().required().custom(isValidObjectId, 'ObjectId validation')
                    .messages({
                        'any.required': 'Course is required.',
                        'string.empty': 'Course is required.',
                        'any.invalid': 'Invalid Course ID.'
                    }),
            })


            const { error, value } = specializationValidation.validate(req.body, { abortEarly: false });
            if (error) {
                console.log(error);
                const errors = {};
                error.details.forEach(err => {
                    errors[err.path[0]] = err.message;
                });
                return res.status(400).json({
                    status: false,
                    errors
                });
            }

            const { name, course } = value;

            const updatedSpecialization = await specializationRepositories.updateSpecialization(req.params.id, { name, course });
            if (!updatedSpecialization) {
                return res.status(404).json({
                    status: false,
                    message: 'Specialization is not found.'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Specialization has been updated successfully.'
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async deleteSpecialization(req, res) {
        try {
            const specializationId = req.params.id;

            const isSpecializationUsed = await specializationRepositories.isSpecializationUsed(specializationId);

            if (isSpecializationUsed) {
                return res.status(400).json({
                    status: false,
                    message: 'Specialization is in use and can not be deleted.'
                });
            }

            const deletedSpecialization = await specializationRepositories.deleteSpecialization(specializationId);
            if (!deletedSpecialization) {
                return res.status(404).json({
                    status: false,
                    message: 'Specialization is not found.'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Specialization has been deleted successfully.'
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getSpecializationsByCourse(req, res) {
        try {
            const courseId = req.params.courseId;

            const specializations = await specializationRepositories.getSpecializationsBycourse(courseId);

            return res.status(200).json({
                status: true,
                message: 'Specializations has been fetched successfully.',
                data: specializations
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }
}

module.exports = new SpecializationController();