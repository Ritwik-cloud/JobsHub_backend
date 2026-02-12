const candidateRepositories = require("../modules/candidate/repositories/candidateRepositories");
const jobRepositories = require("../modules/job/repositories/JobRepositories");
const applicationRepositories = require("../modules/application/repositories/applicationRepositories");
// const transporter = require('../../../config/emailConfig');
const { sendMail } = require('../helper/sendMail');
const portalSettingRepositories  = require("../modules/portal_setting/repositories/portalSettingRepositories");

class ApplicationController {
    async applyForJob(req, res) {
        try {
            const userId = req.user._id;
            const jobId = req.params.id;

            const candidate = await candidateRepositories.findCandidateById(userId);
            if (!candidate) {
                return res.status(404).json({
                    status: false,
                    message: 'Candidate is not found'
                })
            }

            const job = await jobRepositories.getJobById(jobId);
            if (!job) {
                return res.status(404).json({
                    status: false,
                    message: 'Job is not found'
                })
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (job.status !== 'active' || job.applicationDeadline < today) {
                return res.status(400).json({
                    status: false,
                    message: 'Job is not active or application closed'
                })
            }

            const existApplication = await applicationRepositories.getApplicationByJobIdAndUserId(userId, jobId);

            if (existApplication) {
                return res.status(400).json({
                    status: false,
                    message: 'you have already applied to this job'
                })
            }

            if (!candidate.profile?.resume?.path || !candidate.profile?.resume?.originalName) {
                return res.status(400).json({
                    status: false,
                    message: 'you have to upload your resume first, before applying for job'
                })
            }

            const newApplication = await applicationRepositories.createApplication({
                candidate: userId,
                job: jobId,
                status: 'applied',
                resume: {
                    path: candidate.profile?.resume?.path,
                    originalName: candidate.profile?.resume?.originalName
                }
            })

            return res.status(201).json({
                status: true,
                message: 'Applied to this job successfully'
            })


        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }


    // async getApplicationsPageByJob(req, res) {
    //     try {
    //         const jobId = req.params.id;

    //         const job = await jobRepositories.findJobById(jobId);
    //         if (!job) {
    //             return res.redirect('/recruiter/jobs/list');
    //         }

    //         return res.render('recruiter/job-applications', { jobId: jobId, jobTitle: job.title, title: 'Job Applications' })

    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    async getApplicationsPaginationByJobId(req, res) {
        try {
            const jobId = req.params.jobId;

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const search = req.query.search || '';
            const status = req.query.status || '';

            const options = {
                page,
                limit
            }

            const filters = {
                search,
                status
            }

            const result = await applicationRepositories.getApplicationsPaginationByJobId(jobId, options, filters);

            // console.log(result.applications);

            return res.status(200).json({
                status: true,
                message: 'Applications are fetched successfully',
                data: result.applications,
                totalApplications: result.totalCount
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getApplicationDetails(req, res) {
        try {
            const id = req.params.id;

            const applicationData = await applicationRepositories.getApplicationDetails(id);

            if (!applicationData) {
                return res.status(404).message({
                    status: false,
                    message: 'Application is not found'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Application data has been fetched successfully',
                data: applicationData
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async acceptApplication(req, res) {
        try {
            const id = req.params.id;

            const portalSetting = await portalSettingRepositories.getProtalSettings();

            const updatedApplication = await applicationRepositories.updateApplicationStatus(id, 'accepted');

            if (!updatedApplication) {
                return res.status(404).json({
                    status: false,
                    message: 'Application not found'
                });
            }

            const applicationDetail = await applicationRepositories.getJobAndCandidateDetailOfApplication(id);
            console.log(applicationDetail);
            if (!applicationDetail) {
                return res.status(404).json({
                    status: false,
                    message: 'Application or related info not found'
                });
            }

            const portalName = portalSetting.portalName || 'CareerBase';

            const htmlContent = `
  Dear ${applicationDetail.candidateName || 'Candidate'},
  <br><br>
  Good news! Your application for the job title of <strong>${applicationDetail.jobTitle}</strong> at <strong>${applicationDetail.companyName}</strong> has been shortlisted.
  <br><br>
  The employer may reach out to you directly if your profile matches their current requirements. Please keep an eye on your email and phone for further communication.
  <br><br>
  Thank you for using ${portalName}.
  <br><br>
  Regards,<br>
${portalName} Team
            `;

            await sendMail({
                to: applicationDetail.candidateEmail,
                subject: `Testing Node.js Project-Your Application Has Been Shortlisted`,
                html: htmlContent
            });

            return res.status(200).json({
                status: true,
                message: 'Application status has been updated and mailed to candidate successfully',
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async rejectApplication(req, res) {
        try {
            const id = req.params.id;
            const updatedApplication = await applicationRepositories.updateApplicationStatus(id, 'rejected');

            if (!updatedApplication) {
                return res.status(404).json({
                    status: false,
                    message: 'Application not found'
                });
            }

             const portalSetting = await portalSettingRepositories.getProtalSettings();

            const applicationDetail = await applicationRepositories.getJobAndCandidateDetailOfApplication(id);

            if (!applicationDetail) {
                return res.status(404).json({
                    status: false,
                    message: 'Application or related info not found'
                });
            }

            const portalName = portalSetting.portalName || 'CareerBase';

            const htmlContent = `
  Dear ${applicationDetail.candidateName || 'Candidate'},
  <br><br>
  Thank you for applying for the <strong>${applicationDetail.jobTitle}</strong> position at <strong>${applicationDetail.companyName}</strong>.
  <br><br>
  We regret to inform you that your application was not shortlisted by the recruiter for this role.
  <br><br>
  We appreciate your interest and encourage you to explore other opportunities on <strong>${portalName}</strong>.
  <br><br>
  Regards,<br>
${portalName} Team
            `;

            await sendMail({
                to: applicationDetail.candidateEmail,
                subject: `Testing Node.js Project-Application Update – ${applicationDetail.jobTitle} at ${applicationDetail.companyName}`,
                html: htmlContent
            });

            return res.status(200).json({
                status: true,
                message: 'Application status has been updated',
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    

    async getCandidateAppliedJobs(req, res) {
        try {
            const userId = req.user._id;
            const { page = 1, limit = 10 } = req.query;

            const options = {
                skip: (parseInt(page) - 1) * parseInt(limit),
                limit: parseInt(limit)
            };

            const { jobs, totalJobs, totalPages } = await applicationRepositories.getAppliedJobs(userId, options);

            return res.status(200).json({
                status: true,
                message: 'Applied jobs fetched successfully',
                data: jobs,
                totalJobs,
                currentPage: parseInt(page),
                totalPages
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }
}

module.exports = new ApplicationController();