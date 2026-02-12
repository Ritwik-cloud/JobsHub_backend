const applicationModel = require("../../application/model/applicationModel");
const companyModel = require("../../company/model/companyModel")
const jobModel = require("../../job/model/jobModel")
const userModel = require("../../user/model/userModel")


const adminRepositories = {
    getDasboardSummaryData: async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalCandidates,
            totalRecruiters,
            totalCompanies,
            totalJobsPosted,
            totalActiveJobs,
            totalApplications,
            totalAcceptedApplications,
            totalRejectedApplications
        ] = await Promise.all([
            userModel.countDocuments({ role: 'candidate', isRemoved: false }),
            userModel.countDocuments({ role: 'recruiter', isRemoved: false }),
            companyModel.countDocuments({}),
            jobModel.countDocuments({ isDeleted: false }),
            jobModel.countDocuments({ isDeleted: false, status: 'active', applicationDeadline: { $gte: today } }),
            applicationModel.countDocuments({}),
            applicationModel.countDocuments({status:'accepted'}),
            applicationModel.countDocuments({status:'rejected'})
        ]);

        return {
            totalCandidates,
            totalRecruiters,
            totalCompanies,
            totalJobsPosted,
            totalActiveJobs,
            totalApplications,
            totalAcceptedApplications,
            totalRejectedApplications
        };
    }
}

module.exports=adminRepositories;