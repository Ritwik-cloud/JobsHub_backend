const Joi = require('joi');
const courseRepositories = require('../modules/predefined_data/repositories/courseRepositories');
// const specializationRepositories = require('../repositories/specializationRepositories');

class CourseController {
    
    async addCourse(req, res) {
        try {
            const courseValidation = Joi.object({
                educationLevel: Joi.string()
                    .valid('Diploma', 'Graduation', 'Post Graduation')
                    .required()
                    .messages({
                        'string.empty': 'Education level is required.',
                        'any.required': 'Education level is required.',
                        'any.only': 'Education level must be one of Tenth, Twelfth, Diploma, Graduation, Post Graduation.',
                        'string.base': 'Education level must be a string.'
                    }),
                name: Joi.string().trim().required().messages({
                    'string.empty': 'Course name is required.',
                    'any.required': 'Course name is required.'
                })
            })

            const { error, value } = courseValidation.validate(req.body, { abortEarly: false });
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

            const { name, educationLevel } = value;

            const coursePrsent = await courseRepositories.findCourseByname(name);

            if (coursePrsent) {
                return res.status(400).json({
                    status: false,
                    errors: { name: 'Course name is already present.' }
                });
            }

            const newCourse = await courseRepositories.addCourse({ name, educationLevel });

            return res.status(201).json({
                status: true,
                message: 'Course name is saved.',
                data: newCourse
            });


        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getAllCourses(req, res) {
        try {
            const courses = await courseRepositories.getAllCourses();
            return res.status(200).json({
                status: true,
                message: 'Courses fetched successfully.',
                data: courses
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getCourse(req, res) {
        try {
            const course = await courseRepositories.getCourseById(req.params.id);
            if (!course) {
                return res.status(404).json({
                    status: false,
                    message: 'Course is not found.'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Course has been fetched successfully',
                data: course
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async updateCourse(req, res) {
        try {
            const courseValidation = Joi.object({
                educationLevel: Joi.string()
                    .valid('Diploma', 'Graduation', 'Post Graduation')
                    .required()
                    .messages({
                        'string.empty': 'Education level is required.',
                        'any.required': 'Education level is required.',
                        'any.only': 'Education level must be one of Tenth, Twelfth, Diploma, Graduation, Post Graduation.',
                        'string.base': 'Education level must be a string.'
                    }),
                name: Joi.string().trim().required().messages({
                    'string.empty': 'Course name is required.',
                    'any.required': 'Course name is required.'
                })
            })

            const { error, value } = courseValidation.validate(req.body, { abortEarly: false });
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

            const { name, educationLevel } = value;

            const updatedCourse = await courseRepositories.updateCourse(req.params.id, { name, educationLevel });
            if (!updatedCourse) {
                return res.status(404).json({
                    status: false,
                    message: 'Course is not found.'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Course has been updated successfully.'
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async deleteCourse(req, res) {
        try {

            const courseId=req.params.id;

            const isCourseUsed=await courseRepositories.isCourseUsed(courseId);
            if(isCourseUsed){
                return res.status(404).json({
                    status: false,
                    message: 'Course is in use and can not be deleted.'
                })
            }

            const deletedCourse = await courseRepositories.deleteCourse(req.params.id);
            if (!deletedCourse) {
                return res.status(404).json({
                    status: false,
                    message: 'Course is not found.'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Course has been deleted successfully.'
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getCoursesByEducattionLevel(req, res) {
        try {
            const level = req.query.level;
            const courses = await courseRepositories.getCoursesByEducationLevel(level);
            return res.status(200).json({
                status: true,
                message: 'Courses has been fetched successfully.',
                data: courses
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

module.exports = new CourseController();