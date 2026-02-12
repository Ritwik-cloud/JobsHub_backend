const applicationRepositories = require("../modules/application/repositories/applicationRepositories");
const companyRepositories = require("../modules/company/repositories/companyRepositories");
const jobRepositories = require("../modules/job/repositories/JobRepositories");
const recruiterRepositories = require("../modules/recruiter/repositories/recruiterRepositories");
const Joi = require('joi');

class RecruiterController {
    async dashboard(req, res) {
        try {
            const user = req.user;
            const { totalJobs, activeJobs, activeJobsClosingSoon, totalApllicationsCount } = await recruiterRepositories.getDashboardSummaryData(user);
            const jobsWithLeftDays = await jobRepositories.getJobsExpiringInSevenDays(user);
            const { pendingApplictionsCount, acceptedApplictionsCount, rejectedApplictionsCount } = await applicationRepositories.getApplicationsCountsByJob(user);

            const company = await companyRepositories.getCompanyById(user.companyId);
            const recruiter = await recruiterRepositories.getRecruiterById(req.user._id);

            const dashboardData = {
                totalJobs,
                activeJobs,
                activeJobsClosingSoon,
                totalApllicationsCount,
                jobsWithLeftDays,
                pendingApplictionsCount,
                acceptedApplictionsCount,
                rejectedApplictionsCount,
                company: company.name,
                recruiterName: recruiter.name,
                designation: recruiter.recruiterProfile?.designation
            }

            return res.status(200).json({
                status: true,
                message: 'Dashboard data has been fetched successfully',
                data: dashboardData
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getRecruitersExceptCreatorRecruitor(req, res) {
        try {
            const companyId = req.user.companyId;
            const createdBy = req.user._id;
            const recruiters = await recruiterRepositories.getAllRecruitersByCompany(companyId, createdBy); // all recruiters except creator
            // console.log(recruiters);

            return res.status(200).json({
                status: true,
                message: 'Recruiters has been fetched successfully',
                data: recruiters
            })


        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async approveRecruiter(req, res) {
        try {
            const id = req.params.id;
            const approvedRecruiter = await recruiterRepositories.approveRecruiter(id);
            // console.log(approvedRecruiter);
            if (!approvedRecruiter) {
                return res.status(404).json({
                    status: false,
                    message: 'Recruiter is not found.'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Recruiter is approved'
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async deactivateRecruiter(req, res) {
        try {
            const id = req.params.id;
            const deactivatedRecruiter = await recruiterRepositories.deactivateRecruiter(id);
            if (!deactivatedRecruiter) {
                return res.status(404).response({
                    status: false,
                    message: 'Recruiter is not found.'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Recruiter is deactivated'
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }
async activateRecruiter(req, res) {
    try {
        const id = req.params.id;
        const activatedRecruiter = await recruiterRepositories.activateRecruiter(id);

        if (!activatedRecruiter) {
            return res.status(404).json({ 
                status: false,
                message: 'Recruiter is not found.'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Recruiter is activated'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Something went wrong. Please try again later.'
        });
    }
}
    async rejectRecruiter(req, res) {
        try {
            const id = req.params.id;

            const { reason } = req.body;

            if (!reason) {
                return res.status(400).json({
                    success: false,
                    message: 'Rejection reason is required.'
                });
            }

            const recruiter = await recruiterRepositories.getRecruiterById(id);
            if (!recruiter) {
                return res.status(404).response({
                    status: false,
                    message: 'Recruiter is not found.'
                })
            }

            const rejectedRecruiter = await recruiterRepositories.rejectRecruiter(id, reason);

            return res.status(200).json({
                status: true,
                message: 'Recruiter is Rejected'
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getRecruiterProfile(req, res) {
        try {
            const user = await recruiterRepositories.getRecruiterById(req.user._id);
            return res.status(200).json({
                status: true,
                message: 'Recruiter profile has been fetched',
                data: user
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async updateRecruiterProfile(req, res) {
        try {
            const userId = req.user._id;
            console.log(req.body);
            const recruiterProfileValidation = Joi.object({
                name: Joi.string().required().trim().messages({
                    'any.required': 'Name is required',
                    'string.empty': 'Name is required'
                }),
                designation: Joi.string().required().trim().messages({
                    'any.required': 'Designation is required',
                    'string.empty': 'Designation is required'
                })
            })

            const { error, value } = recruiterProfileValidation.validate(req.body, { abortEarly: false });
            if (error) {
                const errors = {};
                error.details.forEach(err => {
                    errors[err.path[0]] = err.message;
                });
                return res.status(400).json({
                    status: false,
                    errors
                });
            }

            const recruiter = await recruiterRepositories.getRecruiterById(userId);

            const { name, designation } = value;

            const profilePicture = req.file ? `uploads/user/${req.file.filename}` : recruiter?.profilePicture;



            const updatedProfile = await recruiterRepositories.updateProfile(userId, { name, designation, profilePicture });

            if (req.file && recruiter?.profilePicture) {
                try {
                    await fs.access(recruiter?.profilePicture)
                    await fs.unlink(recruiter?.profilePicture);
                } catch (error) {
                    if (error.code !== 'ENOENT') {
                        console.error('Error deleting old image:', error);
                    }
                }

            }

            return res.status(200).json({
                status: true,
                message: 'Recruiter profile has been updated',
                data: updatedProfile
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

module.exports = new RecruiterController();