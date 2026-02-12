const applicationRepositories = require("../../application/repositories/applicationRepositories");
const candidateRepositories = require("../../candidate/repositories/candidateRepositories");
const jobRepositories = require("../../job/repositories/JobRepositories");
const adminRepositories = require("../repositories/adminRepositories");

class AdminController {
    async dashboard(req, res) {
        try {
            const {
                totalCandidates,
                totalRecruiters,
                totalCompanies,
                totalJobsPosted,
                totalActiveJobs,
                totalApplications,
                totalAcceptedApplications,
                totalRejectedApplications
            } = await adminRepositories.getDasboardSummaryData();


            const { monthLabels: jobMonthLables, jobCounts } = await jobRepositories.getJobsPostedOverTimeByMonth();
            const { monthLabels: applicationMonthLables, applicationCounts } = await applicationRepositories.getApplicationsOverTimeByMonth();
            const industriesJobsPosting = await jobRepositories.getTopIndusriesPostingJobs();
            const jobCategoriesPostingJobs = await jobRepositories.getTopJobCategoriesPostingJobs();
            const candidateWorkExperienceStatus = await candidateRepositories.getCandidatesWorkExperienceSplit();
            const topAppliedJobs = await applicationRepositories.getTopAppliedJobs();

            return res.render('admin/dashboard', {
                title: 'Admin Dashboard',
                totalCandidates,
                totalRecruiters,
                totalCompanies,
                totalJobsPosted,
                totalActiveJobs,
                totalApplications,
                totalAcceptedApplications,
                totalRejectedApplications,
                topAppliedJobs,
                chartData: {
                    jobsOverTime: {
                        labels: jobMonthLables,
                        data: jobCounts
                    },
                    applicationsOverTime: {
                        labels: applicationMonthLables,
                        data: applicationCounts
                    },
                    topIndustriesJobPosting: {
                        labels: industriesJobsPosting.map(i => i.name),
                        data: industriesJobsPosting.map(i => i.count)
                    },
                    topJobCategoriesJobPosting: {
                        labels: jobCategoriesPostingJobs.map(i => i.name),
                        data: jobCategoriesPostingJobs.map(i => i.count)
                    },
                    candidateWorkExperienceStatus: {
                        labels: candidateWorkExperienceStatus.map(i => i.status),
                        data: candidateWorkExperienceStatus.map(i => i.count)
                    }
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    async getUpdatePasswordPage(req, res) {
        try {
            return res.render('admin/update-password', { title: 'Update Password' })
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new AdminController();