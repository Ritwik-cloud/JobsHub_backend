const jobModel = require('../../job/model/jobModel');
const applicationModel = require('../model/applicationModel');
const mongoose = require('mongoose');

const applicationRepositories = {
    getApplicationByJobIdAndUserId: async (userId, jobId) => {
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(jobId)) {
            return null;
        }

        return applicationModel.findOne({ candidate: userId, job: jobId });
    },
    createApplication: async (data) => {
        const newApplication = new applicationModel(data);
        await newApplication.save();
        return newApplication;
    },

    getAllAplicationsByJob:async(jobId)=>{
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return [];
        }
        return applicationModel.find({job:jobId});

    },

    getApplicationsPaginationByJobId: async (jobId, options = {}, filters = {}) => {
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return {applications:[], totalCount:0};
        }

        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;

        const { search = '', status = '' } = filters;


        const matchCondition = {
            job: new mongoose.Types.ObjectId(jobId)
        }

        if (status) {
            matchCondition.status = status;
        }


        const pipeline = [
            {
                $match: matchCondition
            },
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'job',
                    foreignField: '_id',
                    as: 'jobInfo'
                }
            },
            {
                $unwind: {
                    path: '$jobInfo', preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'candidate',
                    foreignField: '_id',
                    as: 'candidateInfo'
                }
            },
            {
                $unwind: {
                    path: '$candidateInfo', preserveNullAndEmptyArrays: true
                }
            }
        ]

        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'candidateInfo.name': { $regex: search, $options: 'i' } },
                        { 'candidateInfo.email': { $regex: search, $options: 'i' } }
                    ]
                }
            })
        }

        pipeline.push(
            {
                $facet: {
                    applications: [
                        {
                            $skip: skip
                        },
                        {
                            $limit: limit
                        },
                        {
                            $project: {
                                status: 1,
                                resume: 1,
                                applicationDate: 1,
                                job: {
                                    _id: '$jobInfo._id',
                                    title: '$jobInfo.title'
                                },
                                candidate: {
                                    _id: '$candidateInfo._id',
                                    name: '$candidateInfo.name'
                                }
                            }
                        }
                    ],
                    totalCount: [
                        { $count: 'count' }
                    ]
                }
            },

        )

        const results = await applicationModel.aggregate(pipeline);

        const applications = results[0].applications;
        const totalCount = results[0].totalCount[0]?.count || 0;

        return { applications, totalCount };
    },

    getApplicationDetails: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        const results = await applicationModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'candidate',
                    foreignField: '_id',
                    as: 'candidateInfo'
                }
            },
            {
                $unwind: {
                    path: '$candidateInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'skills',
                    localField: 'candidateInfo.profile.skills',
                    foreignField: '_id',
                    as: 'candidateSkills'
                }
            },
            {
                $addFields: {
                    'candidateInfo.profile.workExperience': {
                        $cond: {
                            if: { $isArray: "$candidateInfo.profile.workExperience" },
                            then: {
                                $sortArray: {
                                    input: '$candidateInfo.profile.workExperience',
                                    sortBy: {
                                        currentEmployment: -1,
                                        joiningDate: -1
                                    }
                                }
                            },
                            else: []
                        }
                    },
                    'candidateInfo.profile.education': {
                        $cond: {
                            if: { $isArray: "$candidateInfo.profile.education" },
                            then: "$candidateInfo.profile.education",
                            else: []
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    status: 1,
                    applicationDate: 1,
                    resume: '$candidateInfo.profile.resume',
                    "candidateInfo._id": 1,
                    "candidateInfo.name": 1,
                    "candidateInfo.email": 1,
                    "candidateInfo.profile.workstatus": 1,
                    "candidateInfo.profile.totalExperience": 1,
                    "candidateInfo.profile.phone": 1,
                    "candidateInfo.profilePicture": 1,
                    "candidateInfo.profile.workExperience": 1,
                    "candidateInfo.profile.education": 1,
                    "candidateInfo.profile.skills": "$candidateSkills"

                }
            }
        ]);

        console.log(results[0]);

        return results[0] || null;

    },

    updateApplicationStatus: async (id, status) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await applicationModel.findByIdAndUpdate(id, { status: status }, { new: true, runValidators: true });
    },

    getJobAndCandidateDetailOfApplication: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        const result = await applicationModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },

            {
                $lookup: {
                    from: 'users',
                    localField: 'candidate',
                    foreignField: '_id',
                    as: 'candidateInfo'
                }
            },
            { $unwind: '$candidateInfo' },

            {
                $lookup: {
                    from: 'jobs',
                    localField: 'job',
                    foreignField: '_id',
                    as: 'jobInfo'
                }
            },
            { $unwind: '$jobInfo' },

            {
                $lookup: {
                    from: 'companies',
                    localField: 'jobInfo.company',
                    foreignField: '_id',
                    as: 'companyInfo'
                }
            },
            { $unwind: '$companyInfo' },

            {
                $project: {
                    status: 1,
                    candidateEmail: '$candidateInfo.email',
                    candidateName: '$candidateInfo.name',
                    jobTitle: '$jobInfo.title',
                    companyName: '$companyInfo.name'
                }
            }
        ]);

        return result[0] || null;
    },

    getAppliedJobs: async (userId, options = {}) => {

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return { jobs: [], totalJobs: 0, totalPages: 0 };
        }

        const { skip = 0, limit = 10 } = options;

        const [results] = await applicationModel.aggregate([
            { $match: { candidate: new mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'job',
                    foreignField: '_id',
                    as: 'jobInfo'
                }
            },
            { $unwind: '$jobInfo' },

            {
                $lookup: {
                    from: 'companies',
                    localField: 'jobInfo.company',
                    foreignField: '_id',
                    as: 'companyInfo'
                }
            },
            { $unwind: { path: '$companyInfo', preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    jobId: '$jobInfo._id',
                    title: '$jobInfo.title',
                    jobSlug:'$jobInfo.slug',
                    description: '$jobInfo.description',
                    applicationDate: 1,
                    status: 1,
                    company: {
                        _id: '$companyInfo._id',
                        name: '$companyInfo.name',
                        logo: '$companyInfo.logo'
                    }
                }
            },
            {
                $facet: {
                    totalCount: [{ $count: 'count' }],
                    paginatedResults: [
                        { $skip: skip },
                        { $limit: limit }
                    ]
                }
            }
        ]);

        const jobs = results.paginatedResults || [];
        const totalJobs = results.totalCount[0]?.count || 0;
        const totalPages = Math.ceil(totalJobs / limit);

        return { jobs, totalJobs, totalPages };
    },

    getApplicationCounts: async (userId) => {

        const applicationsCount = await applicationModel.countDocuments({ candidate: userId });
        const acceptedApplicationsCount = await applicationModel.countDocuments({ candidate: userId, status: "accepted" })
        const pendingApplicationsCount = await applicationModel.countDocuments({ candidate: userId, status: "applied" });

        return { applicationsCount, acceptedApplicationsCount, pendingApplicationsCount };
    },

    getApplicationsCountsByJob: async (user) => {

        const matchCondition = {
            isDeleted: false,
            company: user.companyId,
        }

        if (user.recruiterRole === 'basic_recruiter') {
            matchCondition.postedBy = user._id;
        }

        const jobs = await jobModel.find(matchCondition).select('title').lean();

        const jobIds = jobs.map((job) => job._id);

        // const pendingApplictionsCount=await applicationModel.countDocuments({job:{$in:jobIds},status:'applied'});
        // const acceptedApplictionsCount=await applicationModel.countDocuments({job:{$in:jobIds},status:'accepted'});
        // const rejectedApplictionsCount=await applicationModel.countDocuments({job:{$in:jobIds},status:'rejected'});


        // return {pendingApplictionsCount,acceptedApplictionsCount,rejectedApplictionsCount};

        if (jobIds.length === 0) {
            return {
                pendingApplictionsCount: 0,
                acceptedApplictionsCount: 0,
                rejectedApplictionsCount: 0
            };
        }


        const result = await applicationModel.aggregate([
            {
                $match: {
                    job: { $in: jobIds }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);


        const counts = {
            pendingApplictionsCount: 0,
            acceptedApplictionsCount: 0,
            rejectedApplictionsCount: 0
        };

        result.forEach(item => {
            if (item._id === 'applied') counts.pendingApplictionsCount = item.count;
            if (item._id === 'accepted') counts.acceptedApplictionsCount = item.count;
            if (item._id === 'rejected') counts.rejectedApplictionsCount = item.count;
        });

        return counts;

    },

    getApplicationsOverTimeByMonth: async () => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const isBeforeApril = now.getMonth() < 3;

        const accountingYearStart = new Date(isBeforeApril ? currentYear - 1 : currentYear, 3, 1);
        const accountingYearEnd = new Date(isBeforeApril ? currentYear : currentYear + 1, 3, 1);

        const applicationsByMonth = await applicationModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: accountingYearStart,
                        $lt: accountingYearEnd
                    }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.month": 1 }
            }
        ]);

        const monthLabels = [
            'April', 'May', 'June', 'July', 'August', 'September',
            'October', 'November', 'December', 'January', 'February', 'March'
        ];

        const monthIndexMap = {
            4: 0, 5: 1, 6: 2, 7: 3, 8: 4, 9: 5,
            10: 6, 11: 7, 12: 8, 1: 9, 2: 10, 3: 11
        };

        const applicationCounts = new Array(12).fill(0);

        applicationsByMonth.forEach(item => {
            const month = item._id.month;
            const index = monthIndexMap[month];
            applicationCounts[index] = item.count;
        });
        return {
            monthLabels,
            applicationCounts
        }

    },

    getTopAppliedJobs: async (limit = 5) => {
        const topAppliedJobs = await applicationModel.aggregate([
            {
                $group: {
                    _id: '$job',
                    applicationCount: { $sum: 1 }
                }
            },
            {
                $sort: { applicationCount: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: 'jobs',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'jobDetails'
                }
            },
            {
                $unwind: '$jobDetails'
            },
            {
                $lookup: {
                    from: 'companies',
                    localField: 'jobDetails.company',
                    foreignField: '_id',
                    as: 'companyDetails'
                }
            },
            {
                $unwind: '$companyDetails'
            },
            {
                $project: {
                    _id: 0,
                    jobId: '$jobDetails._id',
                    jobTitle: '$jobDetails.title',
                    companyName: '$companyDetails.name',
                    jobType: '$jobDetails.jobType',
                    applicationCount: 1,
                    postedAt: '$jobDetails.createdAt'
                }
            }
        ]);

        return topAppliedJobs;
    }
}

module.exports = applicationRepositories;