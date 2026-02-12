const applicationRepositories = require("../modules/application/repositories/applicationRepositories");
const candidateRepositories = require("../modules/candidate/repositories/candidateRepositories");
const jobRepositories = require("../modules/job/repositories/JobRepositories");
const adminRepositories = require("../modules/admin/repositories/adminRepositories");

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

            const dashboardData = {
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
            }

            return res.status(200).json({
                status: true,
                message: 'Dashbord data fetched successfully',
                data:dashboardData
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

module.exports = new AdminController();