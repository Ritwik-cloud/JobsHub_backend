const skillModel = require("../../predefined_data/model/skillModel");
const jobModel = require("../model/jobModel");
const mongoose = require('mongoose');
const userModel = require('../../user/model/userModel');
const applicationModel = require("../../application/model/applicationModel");


const jobRepositories = {
    createJob: async (data) => {
        // console.log(data);
        const newJob = new jobModel({
            ...data
        })
        await newJob.save();
        return newJob;
    },

    findJobByTitle: async (data) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const jobs = await jobModel.find({
            isDeleted: false,
            status: 'active',
            applicationDeadline: { $gte: today },
            title: { $regex: data, $options: 'i' }
        }).select('title').limit(5);

        return jobs;
    },

    findJobById: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        return await jobModel.findById(id);
    },

    getJobById: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        const job = await jobModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id),
                    isDeleted: false
                }
            },
            {
                $lookup: {
                    from: 'locations',
                    localField: 'location',
                    foreignField: '_id',
                    as: 'location'
                }
            },
            {
                $lookup: {
                    from: 'skills',
                    localField: 'skillsRequired',
                    foreignField: '_id',
                    as: 'skillsRequired'
                }
            }
        ]);
        // console.log(job[0]);
        return job[0] || null;
    },

    updateJob: async (id, data) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const updatedJob = await jobModel.findByIdAndUpdate(id, {
            ...data
        }, { new: true, runValidators: true });

        return updatedJob;
    },

    getPaginatedJobsByRecruiterAndCompany: async (userId, companyId, options, filters) => {
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(companyId)) {
            return {

            };
        }

        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const matchConditions = {
            postedBy: new mongoose.Types.ObjectId(userId),
            company: new mongoose.Types.ObjectId(companyId),
            isDeleted: false
        }

        if (filters.search) {
            matchConditions.title = { $regex: filters.search, $options: 'i' };
        }

        if (filters.status) {
            matchConditions.status = filters.status;
        }

        const results = await jobModel.aggregate([
            {
                $match: matchConditions
            },
            {
                $lookup: {
                    from: 'industries',
                    localField: 'industry',
                    foreignField: '_id',
                    as: 'industry'
                }
            },
            {
                $unwind: '$industry'
            },
            {
                $lookup: {
                    from: 'jobcategories',
                    localField: 'jobCategory',
                    foreignField: '_id',
                    as: 'jobCategory'
                }
            },
            {
                $unwind: '$jobCategory'
            },
            {
                $lookup: {
                    from: 'locations',
                    localField: 'location',
                    foreignField: '_id',
                    as: 'location'
                }
            },
            {
                $lookup: {
                    from: 'skills',
                    localField: 'skillsRequired',
                    foreignField: '_id',
                    as: 'skillsRequired'
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $facet: {
                    jobs: [
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalCount: [
                        { $count: 'count' }
                    ]
                }
            }

        ])

        // const totalJobs = await jobModel.countDocuments({ postedBy: userId, company: companyId });
        const jobs = results[0].jobs || [];
        const totalJobs = results[0].totalCount[0]?.count || 0;

        return { jobs, totalJobs };
    },

    getPaginatedJobsByCompany: async (companyId, options, filters = {}) => {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return [];
        }

        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const matchConditions = {
            company: new mongoose.Types.ObjectId(companyId),
            isDeleted: false
        }

        if (filters.search) {
            matchConditions.title = { $regex: filters.search, $options: 'i' };
        }

        if (filters.status) {
            matchConditions.status = filters.status;
        }

        const results = await jobModel.aggregate([
            {
                $match: matchConditions
            },
            {
                $lookup: {
                    from: 'industries',
                    localField: 'industry',
                    foreignField: '_id',
                    as: 'industry'
                }
            },
            {
                $unwind: '$industry'
            },
            {
                $lookup: {
                    from: 'jobcategories',
                    localField: 'jobCategory',
                    foreignField: '_id',
                    as: 'jobCategory'
                }
            },
            {
                $unwind: '$jobCategory'
            },
            {
                $lookup: {
                    from: 'locations',
                    localField: 'location',
                    foreignField: '_id',
                    as: 'location'
                }
            },
            {
                $lookup: {
                    from: 'skills',
                    localField: 'skillsRequired',
                    foreignField: '_id',
                    as: 'skillsRequired'
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $facet: {
                    jobs: [
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalCount: [
                        { $count: 'count' }
                    ]
                }
            }
        ])

        const jobs = results[0].jobs;
        const totalJobs = results[0].totalCount[0]?.count || 0;

        // const totalJobs = await jobModel.countDocuments({ company: companyId });

        return { jobs, totalJobs };
    },

    getJobs: async (filters = {}, options = {}, userId = null) => {
        const { page = 1, limit = 3, sortColumn = 'createdAt', sortDirection = 'desc' } = options;
        const skip = (page - 1) * limit;

        let pipeline = [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let initialMatchConditions = {
            isDeleted: false,
            status: 'active',
            applicationDeadline: { $gte: today }
        };

        // console.log(filters.jobType);
        if (filters.jobType && filters.jobType.length > 0) {
            initialMatchConditions.jobType = { $in: filters.jobType };
        }

        // console.log(filters.workMode);

        if (filters.workMode && filters.workMode.length > 0) {
            initialMatchConditions.workMode = { $in: filters.workMode };
        }

        if (filters.industry && filters.industry.length > 0) {
            initialMatchConditions.industry = { $in: filters.industry };
        }

        if (filters.jobCategory && filters.jobCategory.length > 0) {
            initialMatchConditions.jobCategory = { $in: filters.jobCategory };
        }

        if (filters.location && filters.location.length > 0) {
            initialMatchConditions.location = { $in: filters.location };
        }

        if (filters.experience !== undefined && filters.experience !== null) {
            // initialMatchConditions.minimumExperience = { $lte: filters.experience };

            // initialMatchConditions.$or = [
            //     { maximumExperience: { $gte: filters.experience } },
            //     { maximumExperience: null }
            // ];

            initialMatchConditions.$and = [
                { minimumExperience: { $lte: filters.experience } },
                {
                    $or: [
                        { maximumExperience: { $gte: filters.experience } },
                        { maximumExperience: { $eq: null } }
                    ]
                }
            ];
        }

        if (filters.postedTime) {
            const postedDate = new Date();
            postedDate.setDate(postedDate.getDate() - filters.postedTime);
            postedDate.setHours(0, 0, 0, 0);
            initialMatchConditions.createdAt = { $gte: postedDate };
        }

        if (filters.search) {
            const searchRegex = new RegExp(filters.search, 'i');
            const globalSearchConditions = [];

            globalSearchConditions.push({ title: searchRegex });


            const matchingSkills = await skillModel.find({ name: searchRegex }).select('_id');
            if (matchingSkills.length > 0) {
                const skillIds = matchingSkills.map(skill => skill._id);
                globalSearchConditions.push({ skillsRequired: { $in: skillIds } });
            }


            if (globalSearchConditions.length > 0) {
                // initialMatchConditions.$or = globalSearchConditions;

                initialMatchConditions.$and = initialMatchConditions.$and || []; // Ensure $and exists
                initialMatchConditions.$and.push({ $or: globalSearchConditions });
            }
        }

        // if (filters.postedTime) {
        //     const postedDate = new Date();
        //     postedDate.setDate(postedDate.getDate() - filters.postedTime);
        //     initialMatchConditions.createdAt = { $gte: postedDate };
        // }

        pipeline.push({ $match: initialMatchConditions });

        pipeline.push(
            {
                $lookup: {
                    from: 'companies',
                    localField: 'company',
                    foreignField: '_id',
                    as: 'companyInfo'
                }
            },
            {
                $unwind: { path: '$companyInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'industries',
                    localField: 'industry',
                    foreignField: '_id',
                    as: 'industryInfo'
                }
            },
            {
                $unwind: { path: '$industryInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'jobcategories',
                    localField: 'jobCategory',
                    foreignField: '_id',
                    as: 'jobCategoryInfo'
                }
            },
            {
                $unwind: { path: '$jobCategoryInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'locations',
                    localField: 'location',
                    foreignField: '_id',
                    as: 'locationInfo'
                }

            },
            {
                $lookup: {
                    from: 'skills',
                    localField: 'skillsRequired',
                    foreignField: '_id',
                    as: 'skillsInfo'
                }

            }
        );


        pipeline.push({
            $project: {
                _id: 1,
                title: 1,
                slug: 1,
                description: 1,
                jobType: 1,
                workMode: 1,
                experienceLevel: 1,
                minimumExperience: 1,
                maximumExperience: 1,
                minimumSalary: 1,
                maximumSalary: 1,
                status: 1,
                postedBy: 1,
                applicationDeadline: 1,
                createdAt: 1,
                updatedAt: 1,
                // Projecting populated fields
                company: {
                    _id: '$companyInfo._id',
                    name: '$companyInfo.name',
                    logo: '$companyInfo.logo'

                },
                industry: {
                    _id: '$industryInfo._id',
                    name: '$industryInfo.name'
                },
                jobCategory: {
                    _id: '$jobCategoryInfo._id',
                    name: '$jobCategoryInfo.name'
                },
                location: {
                    $map: {
                        input: '$locationInfo',
                        as: 'loc',
                        in: { _id: '$$loc._id', name: '$$loc.name' }
                    }
                },
                skillsRequired: {
                    $map: {
                        input: '$skillsInfo',
                        as: 'skill',
                        in: { _id: '$$skill._id', name: '$$skill.name' }
                    }
                }
            }
        });

        const [results] = await jobModel.aggregate([
            ...pipeline,
            {
                $facet: {
                    totalCount: [{ $count: 'count' }],
                    paginatedResults: [
                        { $sort: { [sortColumn]: sortDirection === 'desc' ? -1 : 1 } },
                        { $skip: skip },
                        { $limit: limit }
                    ]
                }
            }
        ]);

        const jobs = results.paginatedResults || [];
        const totalJobs = results.totalCount.length > 0 ? results.totalCount[0].count : 0;

        let bookmarkedJobIds = [];
    
        if (userId) {
            const candidate = await userModel.findOne({ _id: userId, role: 'candidate' }).select('profile.bookmarkedJobs');
            // console.log(candidate);
            if (candidate?.profile?.bookmarkedJobs?.length > 0) {

                bookmarkedJobIds = candidate.profile.bookmarkedJobs.map((id) => id.toString());
                
            }

            jobs.forEach(job => {
                job.isBookmarked = bookmarkedJobIds.includes(job._id.toString());
            });

        }

        return {
            jobs,
            totalJobs,
            currentPage: page,
            totalPages: Math.ceil(totalJobs / limit)
        };

    },

    getDetailJobById: async (id, userId = null) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        const job = await jobModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(id) }
            },
            {
                $lookup: {
                    from: 'companies',
                    localField: 'company',
                    foreignField: '_id',
                    as: 'companyInfo'
                }
            },
            {
                $unwind: { path: '$companyInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'industries',
                    localField: 'industry',
                    foreignField: '_id',
                    as: 'industryInfo'
                }
            },
            {
                $unwind: { path: '$industryInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'jobcategories',
                    localField: 'jobCategory',
                    foreignField: '_id',
                    as: 'jobCategoryInfo'
                }
            },
            {
                $unwind: { path: '$jobCategoryInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'locations',
                    localField: 'location',
                    foreignField: '_id',
                    as: 'locationInfo'
                }

            },
            {
                $lookup: {
                    from: 'skills',
                    localField: 'skillsRequired',
                    foreignField: '_id',
                    as: 'skillsInfo'
                }

            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    jobType: 1,
                    workMode: 1,
                    experienceLevel: 1,
                    minimumExperience: 1,
                    maximumExperience: 1,
                    minimumSalary: 1,
                    maximumSalary: 1,
                    status: 1,
                    postedBy: 1,
                    applicationDeadline: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    // Projecting populated fields
                    company: {
                        _id: '$companyInfo._id',
                        name: '$companyInfo.name',
                        logo: '$companyInfo.logo',
                        description: '$companyInfo.description'

                    },
                    industry: {
                        _id: '$industryInfo._id',
                        name: '$industryInfo.name'
                    },
                    jobCategory: {
                        _id: '$jobCategoryInfo._id',
                        name: '$jobCategoryInfo.name'
                    },
                    location: {
                        $map: {
                            input: '$locationInfo',
                            as: 'loc',
                            in: { _id: '$$loc._id', name: '$$loc.name' }
                        }
                    },
                    skillsRequired: {
                        $map: {
                            input: '$skillsInfo',
                            as: 'skill',
                            in: { _id: '$$skill._id', name: '$$skill.name' }
                        }
                    }
                }
            }

        ]);

        const jobData = job[0] || null;

        let bookmarkedIds = [];

        if (jobData && userId) {
            const candidate = await userModel.findOne(
                { _id: userId, role: 'candidate' },
                'profile.bookmarkedJobs'
            );

            if (candidate?.profile?.bookmarkedJobs?.length > 0) {
                bookmarkedIds = candidate.profile.bookmarkedJobs.map((id) => id.toString());
            }

            jobData.isBookmarked = bookmarkedIds.includes(jobData._id.toString());

            const application = await applicationModel.findOne({
                candidate: userId,
                job: jobData._id
            })

            jobData.isApplied = application ? true : false;
        }

        if (jobData) {
            const applicationCount = await applicationModel.countDocuments({ job: jobData._id });
            jobData.applicationCount = applicationCount;
        }

        return jobData;

    },

    bookMarkJob: async (userId, jobId) => {
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return null;
        }

        const candidate = await userModel.findOne({ _id: userId, role: 'candidate' }).select('profile.bookmarkedJobs');

        if (!candidate) return null;

        if (!candidate.profile) {
            candidate.profile = { bookmarkedJobs: [] };
        }


        if (!Array.isArray(candidate.profile.bookmarkedJobs)) {
            candidate.profile.bookmarkedJobs = [];
        }

        if (!candidate.profile.bookmarkedJobs.includes(jobId)) {
            candidate.profile.bookmarkedJobs.push(jobId);
            await candidate.save();
        }


        return candidate;

    },

    unbookMarkJob: async (userId, jobId) => {
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return null;
        }

        const candidate = await userModel.findOne({ _id: userId, role: 'candidate' }).select('profile.bookmarkedJobs');

        if (!candidate || !candidate.profile || !Array.isArray(candidate.profile.bookmarkedJobs)) {
            return null;
        }

        candidate.profile.bookmarkedJobs.pull(jobId);
        await candidate.save();
        return candidate;

    },

    getRecommendateJobsPaginated: async (userId, options) => {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return { jobs: [], totalJobs: 0, totalPages: 0 };
        }

        const { skip, limit } = options;

        const candidate = await userModel.findOne({ _id: userId, role: 'candidate' });

        if (!candidate?.profile) {
            return {
                jobs: [],
                totalJobs: 0,
                totalPages: 0
            };
        }

        const {
            skills = [],
            preferredIndustry,
            preferredJobCategory,
            preferredLocations = [],
            totalExperience
        } = candidate.profile;

        const experience = totalExperience.years || 0;

        // console.log(experience);

        const today = new Date();
        today.setHours(0, 0, 0, 0);


        const matchConditions = {
            isDeleted: false,
            status: 'active',
            applicationDeadline: { $gte: today }
        };

        const mustMatch = [];

        if (skills.length > 0) {
            mustMatch.push({ skillsRequired: { $in: skills } });
        }

        mustMatch.push({ minimumExperience: { $lte: experience } })
        mustMatch.push({
            $or: [
                { maximumExperience: { $gte: experience } },
                { maximumExperience: null }
            ]
        })

        matchConditions.$and = mustMatch;

        const optionalMatch = [];

        if (preferredIndustry) {
            optionalMatch.push({ industry: preferredIndustry })
        }

        if (preferredJobCategory) {
            optionalMatch.push({ jobCategory: preferredIndustry })
        }

        if (preferredLocations.length > 0) {
            optionalMatch.push({ location: { $in: preferredLocations } });
        }

        if (optionalMatch.length > 0) {
            matchConditions.$or = optionalMatch;
        }

        // console.log(matchConditions);

        const [results] = await jobModel.aggregate([
            {
                $match: matchConditions
            },
            {
                $lookup: {
                    from: 'companies',
                    localField: 'company',
                    foreignField: '_id',
                    as: 'companyInfo'
                }
            },
            {
                $unwind: { path: '$companyInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'industries',
                    localField: 'industry',
                    foreignField: '_id',
                    as: 'industryInfo'
                }
            },
            {
                $unwind: { path: '$industryInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'jobcategories',
                    localField: 'jobCategory',
                    foreignField: '_id',
                    as: 'jobCategoryInfo'
                }
            },
            {
                $unwind: { path: '$jobCategoryInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'locations',
                    localField: 'location',
                    foreignField: '_id',
                    as: 'locationInfo'
                }

            },
            {
                $lookup: {
                    from: 'skills',
                    localField: 'skillsRequired',
                    foreignField: '_id',
                    as: 'skillsInfo'
                }

            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    slug: 1,
                    description: 1,
                    jobType: 1,
                    workMode: 1,
                    experienceLevel: 1,
                    minimumExperience: 1,
                    maximumExperience: 1,
                    minimumSalary: 1,
                    maximumSalary: 1,
                    status: 1,
                    postedBy: 1,
                    applicationDeadline: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    // Projecting populated fields
                    company: {
                        _id: '$companyInfo._id',
                        name: '$companyInfo.name',
                        logo: '$companyInfo.logo'

                    },
                    industry: {
                        _id: '$industryInfo._id',
                        name: '$industryInfo.name'
                    },
                    jobCategory: {
                        _id: '$jobCategoryInfo._id',
                        name: '$jobCategoryInfo.name'
                    },
                    location: {
                        $map: {
                            input: '$locationInfo',
                            as: 'loc',
                            in: { _id: '$$loc._id', name: '$$loc.name' }
                        }
                    },
                    skillsRequired: {
                        $map: {
                            input: '$skillsInfo',
                            as: 'skill',
                            in: { _id: '$$skill._id', name: '$$skill.name' }
                        }
                    }
                }
            },
            {
                $facet: {
                    totalCount: [{ $count: 'count' }],
                    paginatedResults: [
                        { $sort: { 'createdAt': -1 } },
                        { $skip: skip },
                        { $limit: limit }
                    ]
                }
            }
        ]);

        const jobs = results.paginatedResults || [];
        const totalJobs = results.totalCount.length > 0 ? results.totalCount[0].count : 0;

        let bookmarkedJobIds = [];

        if (candidate?.profile?.bookmarkedJobs?.length > 0) {
            bookmarkedJobIds = candidate.profile.bookmarkedJobs.map((id) => id.toString());
        }

        jobs.forEach(job => {
            job.isBookmarked = bookmarkedJobIds.includes(job._id.toString());
        });

        return {
            jobs,
            totalJobs,
            totalPages: Math.ceil(totalJobs / limit)
        };

    },

    getJobDetailInformationById: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        const job = await jobModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(id) }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'postedBy',
                    foreignField: '_id',
                    as: 'postedByInfo'
                }
            },
            {
                $unwind: { path: '$postedByInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'companies',
                    localField: 'company',
                    foreignField: '_id',
                    as: 'companyInfo'
                }
            },
            {
                $unwind: { path: '$companyInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'industries',
                    localField: 'industry',
                    foreignField: '_id',
                    as: 'industryInfo'
                }
            },
            {
                $unwind: { path: '$industryInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'jobcategories',
                    localField: 'jobCategory',
                    foreignField: '_id',
                    as: 'jobCategoryInfo'
                }
            },
            {
                $unwind: { path: '$jobCategoryInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'locations',
                    localField: 'location',
                    foreignField: '_id',
                    as: 'locationInfo'
                }

            },
            {
                $lookup: {
                    from: 'skills',
                    localField: 'skillsRequired',
                    foreignField: '_id',
                    as: 'skillsInfo'
                }

            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    jobType: 1,
                    workMode: 1,
                    experienceLevel: 1,
                    minimumExperience: 1,
                    maximumExperience: 1,
                    minimumSalary: 1,
                    maximumSalary: 1,
                    status: 1,
                    applicationDeadline: 1,
                    vacancies: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    postedBy: {
                        _id: '$postedByInfo._id',
                        name: '$postedByInfo.name',
                        email: '$postedByInfo.email',
                        designation: '$postedByInfo.recruiterProfile.designation'
                    },
                    company: {
                        _id: '$companyInfo._id',
                        name: '$companyInfo.name',
                        logo: '$companyInfo.logo'

                    },
                    industry: {
                        _id: '$industryInfo._id',
                        name: '$industryInfo.name'
                    },
                    jobCategory: {
                        _id: '$jobCategoryInfo._id',
                        name: '$jobCategoryInfo.name'
                    },
                    location: {
                        $map: {
                            input: '$locationInfo',
                            as: 'loc',
                            in: { _id: '$$loc._id', name: '$$loc.name' }
                        }
                    },
                    skillsRequired: {
                        $map: {
                            input: '$skillsInfo',
                            as: 'skill',
                            in: { _id: '$$skill._id', name: '$$skill.name' }
                        }
                    }
                }
            }

        ]);

        const jobData = job[0] || null;

        return jobData;
    },

    softDeleteJob: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        return jobModel.findByIdAndUpdate(id, { isDeleted: true });
    },

    getSavedJobs: async (userId, options) => {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return { jobs: [], totalJobs: 0, totalPages: 0 };
        }

        const { skip = 0, limit = 10 } = options;

        const user = await userModel.findById(userId).select('profile.bookmarkedJobs');
        const bookmarkedJobs = user?.profile?.bookmarkedJobs || [];

        if (bookmarkedJobs.length === 0) {
            return {
                jobs: [],
                totalJobs: 0,
                totalPages: 0
            };
        }

        const [results] = await jobModel.aggregate([
            {
                $match: {
                    _id: { $in: bookmarkedJobs },
                    isDeleted: false,
                    // status: 'active',
                    // applicationDeadline: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
                }
            },
            {
                $lookup: {
                    from: 'companies',
                    localField: 'company',
                    foreignField: '_id',
                    as: 'companyInfo'
                }
            },
            { $unwind: { path: '$companyInfo', preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: 'industries',
                    localField: 'industry',
                    foreignField: '_id',
                    as: 'industryInfo'
                }
            },
            { $unwind: { path: '$industryInfo', preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: 'jobcategories',
                    localField: 'jobCategory',
                    foreignField: '_id',
                    as: 'jobCategoryInfo'
                }
            },
            { $unwind: { path: '$jobCategoryInfo', preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: 'locations',
                    localField: 'location',
                    foreignField: '_id',
                    as: 'locationInfo'
                }
            },
            {
                $lookup: {
                    from: 'skills',
                    localField: 'skillsRequired',
                    foreignField: '_id',
                    as: 'skillsInfo'
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    slug: 1,
                    description: 1,
                    jobType: 1,
                    workMode: 1,
                    experienceLevel: 1,
                    minimumExperience: 1,
                    maximumExperience: 1,
                    minimumSalary: 1,
                    maximumSalary: 1,
                    status: 1,
                    postedBy: 1,
                    applicationDeadline: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    company: {
                        _id: '$companyInfo._id',
                        name: '$companyInfo.name',
                        logo: '$companyInfo.logo'
                    },
                    industry: {
                        _id: '$industryInfo._id',
                        name: '$industryInfo.name'
                    },
                    jobCategory: {
                        _id: '$jobCategoryInfo._id',
                        name: '$jobCategoryInfo.name'
                    },
                    location: {
                        $map: {
                            input: '$locationInfo',
                            as: 'loc',
                            in: { _id: '$$loc._id', name: '$$loc.name' }
                        }
                    },
                    skillsRequired: {
                        $map: {
                            input: '$skillsInfo',
                            as: 'skill',
                            in: { _id: '$$skill._id', name: '$$skill.name' }
                        }
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
        const totalJobs = results.totalCount.length > 0 ? results.totalCount[0].count : 0;
        const totalPages = Math.ceil(totalJobs / limit);


        jobs.forEach(job => job.isBookmarked = true);

        return {
            jobs,
            totalJobs,
            totalPages
        };

    },

    getRecommendedJobs: async (userId) => {
        const candidate = await userModel.findOne({ _id: userId, role: 'candidate' });

        if (!candidate?.profile) {
            return {
                recommendedJobs: [],
                totalRecommendedJobs: 0
            };
        }

        const {
            skills = [],
            preferredIndustry,
            preferredJobCategory,
            preferredLocations = [],
            totalExperience
        } = candidate.profile;

        const experience = totalExperience.years || 0;



        const today = new Date();
        today.setHours(0, 0, 0, 0);


        const matchConditions = {
            isDeleted: false,
            status: 'active',
            applicationDeadline: { $gte: today }
        };

        const mustMatch = [];

        if (skills.length > 0) {
            mustMatch.push({ skillsRequired: { $in: skills } });
        }

        mustMatch.push({ minimumExperience: { $lte: experience } })
        mustMatch.push({
            $or: [
                { maximumExperience: { $gte: experience } },
                { maximumExperience: null }
            ]
        })

        matchConditions.$and = mustMatch;

        const optionalMatch = [];

        if (preferredIndustry) {
            optionalMatch.push({ industry: preferredIndustry })
        }

        if (preferredJobCategory) {
            optionalMatch.push({ jobCategory: preferredIndustry })
        }

        if (preferredLocations.length > 0) {
            optionalMatch.push({ location: { $in: preferredLocations } });
        }

        if (optionalMatch.length > 0) {
            matchConditions.$or = optionalMatch;
        }

        // console.log(matchConditions);

        const results = await jobModel.aggregate([
            {
                $match: matchConditions
            },
            {
                $lookup: {
                    from: 'companies',
                    localField: 'company',
                    foreignField: '_id',
                    as: 'companyInfo'
                }
            },
            {
                $unwind: { path: '$companyInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'industries',
                    localField: 'industry',
                    foreignField: '_id',
                    as: 'industryInfo'
                }
            },
            {
                $unwind: { path: '$industryInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'jobcategories',
                    localField: 'jobCategory',
                    foreignField: '_id',
                    as: 'jobCategoryInfo'
                }
            },
            {
                $unwind: { path: '$jobCategoryInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'locations',
                    localField: 'location',
                    foreignField: '_id',
                    as: 'locationInfo'
                }

            },
            {
                $lookup: {
                    from: 'skills',
                    localField: 'skillsRequired',
                    foreignField: '_id',
                    as: 'skillsInfo'
                }

            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    slug: 1,
                    description: 1,
                    jobType: 1,
                    workMode: 1,
                    experienceLevel: 1,
                    minimumExperience: 1,
                    maximumExperience: 1,
                    minimumSalary: 1,
                    maximumSalary: 1,
                    status: 1,
                    postedBy: 1,
                    applicationDeadline: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    // Projecting populated fields
                    company: {
                        _id: '$companyInfo._id',
                        name: '$companyInfo.name',
                        logo: '$companyInfo.logo'

                    },
                    industry: {
                        _id: '$industryInfo._id',
                        name: '$industryInfo.name'
                    },
                    jobCategory: {
                        _id: '$jobCategoryInfo._id',
                        name: '$jobCategoryInfo.name'
                    },
                    location: {
                        $map: {
                            input: '$locationInfo',
                            as: 'loc',
                            in: { _id: '$$loc._id', name: '$$loc.name' }
                        }
                    },
                    skillsRequired: {
                        $map: {
                            input: '$skillsInfo',
                            as: 'skill',
                            in: { _id: '$$skill._id', name: '$$skill.name' }
                        }
                    }
                }
            },
            {
                $facet: {
                    totalCount: [{ $count: 'count' }],
                    jobs: [
                        { $sort: { 'createdAt': -1 } }
                    ]
                }
            }
        ]);

        // const recommendedJobs = results[0].jobs || [];
        // const totalRecommendedJobs = results.totalCount.length > 0 ? results.totalCount[0].count : 0;
        const result = results[0] || {};

        const recommendedJobs = result.jobs || [];
        const totalRecommendedJobs = result.totalCount?.[0]?.count || 0;

        return { recommendedJobs, totalRecommendedJobs };

    },

    getJobsExpiringInSevenDays: async (user) => {

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);
        sevenDaysFromNow.setHours(23, 59, 59, 999);

        const matchCondition = {
            isDeleted: false,
            company: user.companyId,
            status: 'active',
            applicationDeadline: {
                $gte: today,
                $lte: sevenDaysFromNow
            }
        }

        if (user.recruiterRole === 'basic_recruiter') {
            matchCondition.postedBy = user._id;
        }

        const jobs = await jobModel.find(matchCondition).select('title applicationDeadline').lean();

        const jobsWithLeftDays = jobs.map((job) => {
            const deadline = new Date(job.applicationDeadline);
            const msInADay = 1000 * 60 * 60 * 24;

            const daysLeft = Math.ceil((deadline - today) / msInADay);

            return {
                ...job,
                daysLeft
            }
        })

        return jobsWithLeftDays;

    },

    getJobsPostedOverTimeByMonth: async () => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const isBeforeApril = now.getMonth() < 3;

        const accountingYearStart = new Date(isBeforeApril ? currentYear - 1 : currentYear, 3, 1);
        const accountingYearEnd = new Date(isBeforeApril ? currentYear : currentYear + 1, 3, 1);

        const jobsByMonth = await jobModel.aggregate([
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
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ])

        const monthLabels = [
            'April', 'May', 'June', 'July', 'August', 'September',
            'October', 'November', 'December', 'January', 'February', 'March'
        ];

        const monthIndexMap = {
            4: 0, 5: 1, 6: 2, 7: 3, 8: 4, 9: 5,
            10: 6, 11: 7, 12: 8, 1: 9, 2: 10, 3: 11
        };

        const jobCounts = new Array(12).fill(0);

        jobsByMonth.forEach(item => {
            const month = item._id.month;
            const index = monthIndexMap[month];
            jobCounts[index] = item.count;
        });

        return {
            monthLabels,
            jobCounts
        }

    },

    getTopIndusriesPostingJobs: async (limit = 5) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const result = await jobModel.aggregate([
            { $match: { isDeleted: false, status: 'active', applicationDeadline: { $gte: today } } },
            {
                $group: {
                    _id: "$industry",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            { $limit: limit },
            {
                $lookup: {
                    from: 'industries',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'industry'
                }
            },
            {
                $unwind: "$industry"
            },
            {
                $project: {
                    _id: 0,
                    name: "$industry.name",
                    count: 1
                }
            }
        ]);

        return result;
    },

    getTopJobCategoriesPostingJobs: async (limit = 5) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const result = await jobModel.aggregate([
            { $match: { isDeleted: false, status: 'active', applicationDeadline: { $gte: today } } },
            {
                $group: {
                    _id: "$jobCategory",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            { $limit: limit },
            {
                $lookup: {
                    from: 'jobcategories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'jobCategory'
                }
            },
            {
                $unwind: "$jobCategory"
            },
            {
                $project: {
                    _id: 0,
                    name: "$jobCategory.name",
                    count: 1
                }
            }
        ]);

        return result;
    },



}

module.exports = jobRepositories;