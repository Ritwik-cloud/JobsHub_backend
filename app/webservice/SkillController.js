const Joi = require('joi');
const skillRepositories = require('../modules/predefined_data/repositories/skillRepositories');

class SkillController {
    

    async addSkill(req, res) {
        try {
            const skillValidation = Joi.object({
                name: Joi.string().trim().required().messages({
                    'string.empty': 'Skill name is required.',
                    'any.required': 'Skill name is required.'
                })
            })

            const { error, value } = skillValidation.validate(req.body, { abortEarly: false });
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
                .replace(/[^a-z0-9+#]/g, '');

            const isPresent = await skillRepositories.findSkillByNormalizedName(normalizedName);
            if (isPresent) {
                return res.status(400).json({
                    status: false,
                    errors: { name: 'Skill name is already present.' }
                });
            }

            const newSkill = await skillRepositories.addSkill({ name, normalized: normalizedName });

            return res.status(201).json({
                status: true,
                message: 'Skill name is saved.',
                data: newSkill
            });


        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getAllSkills(req, res) {
        try {
            const skills = await skillRepositories.getAllSkills();

            // console.log(skills);
            return res.status(200).json({
                status: true,
                message: 'Skills fetched successfully.',
                data: skills
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getSkill(req, res) {
        try {
            const skill = await skillRepositories.getSkillById(req.params.id);
            if (!skill) {
                return res.status(404).json({
                    status: false,
                    message: 'Skill is not found.'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Skill has been fetched successfully.',
                data: skill
            })

        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async updateSkill(req, res) {
        try {
            const skillValidation = Joi.object({
                name: Joi.string().trim().required().messages({
                    'string.empty': 'Skill name is required.',
                    'any.required': 'Skill name is required.'
                })
            })

            const { error, value } = skillValidation.validate(req.body, { abortEarly: false });
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
                .replace(/[^a-z0-9+#]/g, '');

            const updatedSkill = await skillRepositories.updateSkill(req.params.id, { name, normalized: normalizedName });
            if (!updatedSkill) {
                return res.status(404).json({
                    status: false,
                    message: 'Skill is not found.'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Skill has been updated successfully.'
            })

        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async deleteSkill(req, res) {
        try {

            const skillId = req.params.id;

            const isUsedInCandidate = await skillRepositories.isSkillUsedInCandidate(skillId)
            const isUsedInJob = await skillRepositories.isSkillUsedInJob(skillId);

            if(isUsedInCandidate || isUsedInJob){
                 return res.status(400).json({
                    status: false,
                    message: 'Skill is in use and cannot be deleted.'
                })
            }

            const deletedSkill = await skillRepositories.deleteSkill(req.params.id);
            if (!deletedSkill) {
                return res.status(404).json({
                    status: false,
                    message: 'Skill is not found.'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Skill has been deleted successfully.'
            })

        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async searchSkill(req, res) {
        try {
            const { q } = req.query;
            const normalizedQuery = q.toLowerCase()
                .replace(/\s+/g, '')
                .replace(/[^a-z0-9+#]/g, '');

            const skills = await skillRepositories.searchSkillByNormalizedName(normalizedQuery);
            // console.log(skills);
            return res.status(200).json({
                status: true,
                message: 'Skill has been fetched successfully.',
                skills
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

module.exports = new SkillController();