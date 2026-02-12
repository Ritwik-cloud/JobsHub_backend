const Joi = require('joi');
const mongoose = require('mongoose');
const jobCategoryRepositories = require("../modules/predefined_data/repositories/jobcategoryRepositories");

class JobCategoryController {
   

    async addJobCategory(req, res) {
        try {
            const isValidObjectId = (value, helpers) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    return helpers.message('any.invalid');
                }
                return value;
            };

            const jobCategoryValidation = Joi.object({
                // industry: Joi.string().custom(isValidObjectId, 'ObjectId validation').required().messages({
                //     'any.required': 'Industry is required',
                //     'string.empty': 'Industry is required',
                //     'string.base': 'Industry Id must be a string',
                //     'any.invalid': 'Invalid industry ID'
                // }),
                name: Joi.string().trim().required().messages({
                    'string.empty': 'Industry name is required.',
                    'any.required': 'Industry name is required.'
                })
            })

            const { error, value } = jobCategoryValidation.validate(req.body, { abortEarly: false });
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

            const { name } = value;

            const normalizedName = name.toLowerCase()
                .replace(/\s+/g, '')
                .replace(/[^a-z0-9]/g, '');

            const newJobCategory = await jobCategoryRepositories.addJobCatgory({ name, normalized: normalizedName});

            return res.status(201).json({
                status: true,
                message: 'Job category name is saved.',
                data: newJobCategory
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getAllJobCategories(req, res) {
        try {
            const jobCategories = await jobCategoryRepositories.getAllJobCategories();
            return res.status(200).json({
                status: true,
                message: 'Job categories fetched successfully.',
                data: jobCategories
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getJobCategory(req, res) {
        try {
            const jobCategory = await jobCategoryRepositories.getJobCategoryById(req.params.id);
            if (!jobCategory) {
                return res.status(404).json({
                    status: false,
                    message: 'Job category is not found.'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Job category has been fetched successfully',
                data: jobCategory
            })

        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async updateJobCategory(req, res) {
        try {
            const isValidObjectId = (value, helpers) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    return helpers.message('any.invalid');
                }
                return value;
            };

            const jobCategoryValidation = Joi.object({
                name: Joi.string().trim().required().messages({
                    'string.empty': 'Industry name is required.',
                    'any.required': 'Industry name is required.'
                })
            })

            const { error, value } = jobCategoryValidation.validate(req.body, { abortEarly: false });
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

            const { name } = value;

            const normalizedName = name.toLowerCase()
                .replace(/\s+/g, '')
                .replace(/[^a-z0-9]/g, '');

            const updatedJobCategory = await jobCategoryRepositories.updateJobCategory(req.params.id, { name, normalized: normalizedName});
            if (!updatedJobCategory) {
                return res.status(404).json({
                    status: false,
                    message: 'Job category is not found.'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Job category has been updated successfully.'
            })

        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

     async deleteJobCategory(req, res) {
            try {
                const jobCategoryId=req.params.id;

                const isJobCategoryUsed=await jobCategoryRepositories.isJobCategoryUsed(jobCategoryId);
                if(isJobCategoryUsed){
                    return res.status(400).json({
                        status: false,
                        message: 'Job category is in use and can not be deleted.'
                    })
                }

                const deletedJobCategory = await jobCategoryRepositories.deleteJobCategory(jobCategoryId);
                if (!deletedJobCategory) {
                    return res.status(404).json({
                        status: false,
                        message: 'Job category is not found.'
                    })
                }
    
                return res.status(200).json({
                    status: true,
                    message: 'Job category has been deleted successfully.'
                })
    
            } catch (error) {
                console.log(error);
                res.status(500).json({
                    status: false,
                    message: 'Something went wrong. Please try again later.'
                });
            }
        }

        async getJobCategoriesByIndustry(req,res){
            try {
                const industryId=req.params.industryId;
                const jobCategories=await jobCategoryRepositories.getJobCategoriesByIndustryId(industryId);
                 return res.status(200).json({
                    status: true,
                    message: 'Job category has been fetched successfully.',
                    data:jobCategories
                })
            } catch (error) {
                console.log(error);
                res.status(500).json({
                    status: false,
                    message: 'Something went wrong. Please try again later.'
                });
            }
        }
    
}

module.exports = new JobCategoryController();