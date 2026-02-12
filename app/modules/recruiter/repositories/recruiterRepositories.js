const companyModel = require("../../company/model/companyModel");
const userModel = require("../../user/model/userModel")
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const jobModel = require("../../job/model/jobModel");
const applicationModel = require("../../application/model/applicationModel");

const recruiterRepositories = {
    getAllRecruitersByCompany: async (companyId, createdBy) => {
        const recruitersData = await userModel.find({ role: 'recruiter', company: companyId, _id: { $ne: createdBy } }).select('-password');
        const recruiters = recruitersData.map(r => ({
            ...r.toObject(),
            createdAtFormatted: moment(r.createdAt).tz('Asia/Kolkata').format('DD-MM-YYYY')
        }));

        return recruiters;
    },

    getRecruiterById: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        return userModel.findOne({ _id: id, role: 'recruiter' }).select('-password');

    },

    approveRecruiter: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return userModel.findOneAndUpdate({ _id: id, role: 'recruiter' }, { 'recruiterProfile.approvalStatus': 'approved' }, { new: true });
    },

    deactivateRecruiter: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return userModel.findOneAndUpdate({ _id: id, role: 'recruiter' }, { 'recruiterProfile.isActive': false }, { new: true });
    },

    activateRecruiter: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return userModel.findOneAndUpdate({ _id: id, role: 'recruiter' }, { 'recruiterProfile.isActive': true }, { new: true });
    },

    rejectRecruiter: async (id, reason) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        const recruiter = await userModel.findOne({ _id: id, role: 'recruiter' });

        const company = await companyModel.findById(recruiter.company);

        if (recruiter.company) {
            await companyModel.findByIdAndUpdate(recruiter.company, {
                $pull: { recruiters: id }
            });
        }

        return await userModel.findOneAndUpdate({ _id: id, role: 'recruiter' }, {
            $set: {
                company: null,
                'recruiterProfile.approvalStatus': 'rejected',
                'recruiterProfile.isActive': false,
                'recruiterProfile.rejectionReason': company.name + ' : ' + reason,

            }

        });
    },

    getDashboardSummaryData: async (user) => {
        const matchCondition = {
            isDeleted: false,
            company: user.companyId
        };

        if (user.recruiterRole === 'basic_recruiter') {
            matchCondition.postedBy = user._id;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);
        threeDaysFromNow.setHours(23, 59, 59, 999);

        const jobs = await jobModel.find(matchCondition).lean();

        const activeJobs = jobs.filter((job) => {
            return job.status === 'active' && job.applicationDeadline >= today;
        });

        const activeJobsClosingSoon = jobs.filter(job => {
            const deadline = new Date(job.applicationDeadline);
            return job.status === 'active' && deadline >= today && deadline <= threeDaysFromNow;
        });

        const jobIds = jobs.map((job) => job._id);

        const applicationsCount = await applicationModel.countDocuments({ job: { $in: jobIds } });



        return {
            totalJobs: jobs.length,
            activeJobs: activeJobs.length,
            activeJobsClosingSoon: activeJobsClosingSoon.length,
            totalApllicationsCount: applicationsCount
        }

    },

    updateProfile: async (id, data) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        const { name, designation, profilePicture } = data;
        return await userModel.findOneAndUpdate({ _id: id, role: 'recruiter' }, {
            name,
            'recruiterProfile.designation': designation,
            profilePicture
        }, { new: true, runValidators: true })
    }

}

module.exports = recruiterRepositories