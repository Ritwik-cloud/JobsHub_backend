const Joi = require('joi');
const industryRepositories = require('../repositories/industryRepositories');

class IndustryController {
    async manageIndustryPage(req, res) {
        try {
            return res.render('admin/industry', { title: 'Manage Industry' });

        } catch (error) {
            console.log(error);
        }
    }

    async addIndustry(req, res) {
        try {
            const industryValidation = Joi.object({
                name: Joi.string().trim().required().messages({
                    'string.empty': 'Industry name is required.',
                    'any.required': 'Industry name is required.'
                })
            })

            const { error, value } = industryValidation.validate(req.body, { abortEarly: false });
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

            const isPresent = await industryRepositories.findIndustryByNormalizedName(normalizedName);
            if (isPresent) {
                return res.status(400).json({
                    status: false,
                    errors: { name: 'Industry name is already present.' }
                });
            }

            const newIndustry = await industryRepositories.addIndustry({ name, normalized: normalizedName });

            return res.status(201).json({
                status: true,
                message: 'Industry name is saved.',
                data: newIndustry
            });


        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getAllIndustries(req, res) {
        try {
            const industries = await industryRepositories.getAllIndustries();
            return res.status(200).json({
                status: true,
                message: 'Industries fetched successfully.',
                data: industries
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getIndustry(req, res) {
        try {
            const industry = await industryRepositories.getIndustryById(req.params.id);
            if (!industry) {
                return res.status(404).json({
                    status: false,
                    message: 'Industry is not found.'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Industry has been fetched successfully',
                data: industry
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async updateIndustry(req, res) {
        try {
            const industryValidation = Joi.object({
                name: Joi.string().trim().required().messages({
                    'string.empty': 'Industry name is required.',
                    'any.required': 'Industry name is required.'
                })
            })

            const { error, value } = industryValidation.validate(req.body, { abortEarly: false });
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
                .replace(/\s+/g, '')
                .replace(/[^a-z0-9]/g, '');

            const updatedIndustry = await industryRepositories.updateIndustry(req.params.id, { name, normalized: normalizedName });
            if (!updatedIndustry) {
                return res.status(404).json({
                    status: false,
                    message: 'Industry is not found.'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Industry has been updated successfully.'
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async deleteIndustry(req, res) {
        try {
            const industryId=req.params.id;

            const isIndustryUsed=await industryRepositories.isIndustryUsed(industryId);

            if(isIndustryUsed){
                 return res.status(400).json({
                    status: false,
                    message: 'Industry is in use and can not be deleted.'
                })
            }

            const deletedIndustry = await industryRepositories.deleteIndustry(industryId);
            if (!deletedIndustry) {
                return res.status(404).json({
                    status: false,
                    message: 'Industry is not found.'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Industry has been deleted successfully.'
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

module.exports = new IndustryController();