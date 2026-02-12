const courseModel = require('../../predefined_data/model/courseModel');
const specializationModel = require('../../predefined_data/model/specializationModel');
const userModel = require('../../user/model/userModel');
const mongoose = require('mongoose');

const candidateRepositories = {
    getCandidateProfileById: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        // return await userModel.findOne({ _id: id, role: 'candidate' }).populate('profile.skills').select('-password');

        // const result = await userModel.aggregate([
        //     {
        //         $match: {
        //             _id: new mongoose.Types.ObjectId(id),
        //             role: 'candidate'
        //         }
        //     },
        //     {
        //         $addFields: {
        //             profile: { $ifNull: ['$profile', {}] }
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'skills',
        //             localField: 'profile.skills',
        //             foreignField: '_id',
        //             as: 'profileSkills'
        //         }
        //     },
        //     {
        //         $addFields: {
        //             'profile.skills': '$profileSkills'
        //         }
        //     },
        //     {
        //         $set: {
        //             'profile.workExperience': {
        //                 $sortArray: {
        //                     input: '$profile.workExperience',
        //                     sortBy: {
        //                         currentEmployment: -1,     // true (1) comes first
        //                         joiningDate: -1            // latest date next
        //                     }
        //                 }
        //             }
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'industries',
        //             localField: 'profile.preferredIndustry',
        //             foreignField: '_id',
        //             as: 'profile.preferredIndustry'
        //         }
        //     },
        //     {
        //         $unwind: '$profile.preferredIndustry'
        //     },
        //     {
        //         $lookup: {
        //             from: 'jobcategories',
        //             localField: 'profile.preferredJobCategory',
        //             foreignField: '_id',
        //             as: 'profile.preferredJobCategory'
        //         }
        //     },
        //     {
        //         $unwind: '$profile.preferredJobCategory'
        //     },
        //     {
        //         $lookup: {
        //             from: 'locations',
        //             localField: 'profile.preferredLocations',
        //             foreignField: '_id',
        //             as: 'profile.preferredLocations'
        //         }
        //     },
        //     {
        //         $project: {
        //             password: 0,
        //             profileSkills: 0
        //         }
        //     }
        // ]);

        const result = await userModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id),
                    role: 'candidate'
                }
            },
            // Ensure profile exists as an object
            {
                $addFields: {
                    profile: { $ifNull: ['$profile', {}] }
                }
            },
            {
                $lookup: {
                    from: 'skills',
                    localField: 'profile.skills',
                    foreignField: '_id',
                    as: 'profileSkills'
                }
            },
            {
                $addFields: {
                    'profile.skills': '$profileSkills'
                }
            },
            {
                $set: {
                    'profile.workExperience': {
                        $cond: {
                            if: { $isArray: '$profile.workExperience' },
                            then: {
                                $sortArray: {
                                    input: '$profile.workExperience',
                                    sortBy: {
                                        currentEmployment: -1,
                                        joiningDate: -1
                                    }
                                }
                            },
                            else: []
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'industries',
                    localField: 'profile.preferredIndustry',
                    foreignField: '_id',
                    as: 'profile.preferredIndustry'
                }
            },
            {
                $addFields: {
                    'profile.preferredIndustry': {
                        $arrayElemAt: ['$profile.preferredIndustry', 0]
                    }
                }
            },
            {
                $lookup: {
                    from: 'jobcategories',
                    localField: 'profile.preferredJobCategory',
                    foreignField: '_id',
                    as: 'profile.preferredJobCategory'
                }
            },
            {
                $addFields: {
                    'profile.preferredJobCategory': {
                        $arrayElemAt: ['$profile.preferredJobCategory', 0]
                    }
                }
            },
            {
                $lookup: {
                    from: 'locations',
                    localField: 'profile.preferredLocations',
                    foreignField: '_id',
                    as: 'profile.preferredLocations'
                }
            },
            {
                $project: {
                    password: 0,
                    profileSkills: 0
                }
            }
        ]);

        const candidate = result[0];

        if (!candidate) {
            return null;
        }

        if (candidate?.profile?.education?.length > 0) {
            const courseIds = candidate.profile.education
                .filter(e => mongoose.Types.ObjectId.isValid(e.course))
                .map(e => e.course);

            const specializationIds = candidate.profile.education
                .filter(e => mongoose.Types.ObjectId.isValid(e.specialization))
                .map(e => e.specialization);

            const [courses, specializations] = await Promise.all([
                courseModel.find({ _id: { $in: courseIds } }, { _id: 1, name: 1 }),
                specializationModel.find({ _id: { $in: specializationIds } }, { _id: 1, name: 1 })
            ]);

            const courseMap = Object.fromEntries(courses.map(c => [c._id.toString(), c.name]));
            const specializationMap = Object.fromEntries(specializations.map(s => [s._id.toString(), s.name]));

            candidate.profile.education = candidate.profile.education.map(edu => ({
                ...edu,
                course: edu.course && courseMap[edu.course.toString()] ? courseMap[edu.course.toString()] : null,
                specialization: edu.specialization && specializationMap[edu.specialization.toString()] ? specializationMap[edu.specialization.toString()] : null
            }));
        }

        return candidate;


    },

    getCandidateBasicDetails: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await userModel.findOne({ _id: id, role: 'candidate' }).select('name email profilePicture profile.dob profile.gender profile.phone profile.address profile.workstatus profile.totalExperience profile.currentSalary profile.availabiltyToJoin updatedAt').lean();
    },

    getCandidateProfileSummary: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        const candidate = await userModel.findOne({ _id: id, role: 'candidate' }).select('profile.profileSummary');
        return candidate?.profile?.profileSummary || '';

    },

    findCandidateById: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await userModel.findOne({ _id: id, role: 'candidate' }).select('-password');
    },


    updateCandidateBasicDetails: async (id, data) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const { name, dob, address, phone, gender, workstatus, totalExperience, currentSalary, availabilityToJoin } = data;
        return await userModel.findOneAndUpdate({ _id: id, role: 'candidate' }, {
            name,
            'profile.dob': dob,
            'profile.phone': phone,
            'profile.gender': gender,
            'profile.address': address,
            'profile.workstatus': workstatus,
            'profile.currentSalary': currentSalary,
            'profile.availabiltyToJoin': availabilityToJoin,
            'profile.totalExperience': totalExperience
        }, { new: true, runValidators: true, projection: { name: 1, profile: 1, updatedAt: 1 } });
    },

    updateCandidateProfilePicture: async (id, image) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await userModel.findOneAndUpdate({ _id: id, role: 'candidate' }, {
            profilePicture: image
        }, { new: true, runValidators: true, projection: { profilePicture: 1 } });

    },


    updateCandidateProfileSummary: async (id, data) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        return await userModel.findOneAndUpdate({ _id: id, role: 'candidate' }, {
            'profile.profileSummary': data
        }, { new: true, runValidators: true, projection: { 'profile.profileSummary': 1 } });
    },

    getCandidateSkills: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return [];
        }

        // const candidate = await userModel.findOne({ _id: id, role: 'candidate' }).populate('profile.skills');
        // const skills = candidate?.profile?.skills || [];

        // return skills.map(skill => ({
        //     _id: skill._id,
        //     name: skill.name
        // }));

        const result = await userModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(id), role: 'candidate' }
            },
            {
                $addFields: {
                    profile: { $ifNull: ['$profile', {}] }
                }
            },
            {
                $lookup: {
                    from: 'skills',
                    localField: 'profile.skills',
                    foreignField: '_id',
                    as: 'skillsInfo'
                }
            },
            {
                $project: {
                    skills: {
                        $map: {
                            input: '$skillsInfo',
                            as: 'skill',
                            in: {
                                _id: '$$skill._id',
                                name: '$$skill.name'
                            }
                        }
                    }
                }
            }
        ])

        return result[0].skills || [];

    },

    getCandidateWorkExperiences: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return [];
        }

        // const result = await userModel.aggregate([
        //     { $match: { _id: new mongoose.Types.ObjectId(id), role: 'candidate' } },
        //     { $addFields: { 'profile.workExperience': { $ifNull: ['$profile.workExperience', []] } } },
        //     {
        //         $set: {
        //             'profile.workExperience': {
        //                 $cond: {
        //                     if: { $isArray: '$profile.workExperience' },
        //                     then: {
        //                         $sortArray: {
        //                             input: '$profile.workExperience',
        //                             sortBy: { currentEmployment: -1, joiningDate: -1 }
        //                         }
        //                     },
        //                     else: []
        //                 }
        //             }
        //         }
        //     },
        //     { $project: { _id: 0, workExperience: '$profile.workExperience' } }
        // ]);

        const result = await userModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id), role: 'candidate' } },
            {
                $project: {
                    workExperience: {
                        $cond: {
                            if: { $isArray: '$profile.workExperience' },
                            then: '$profile.workExperience',
                            else: []
                        }
                    }
                }
            },
            { $unwind: '$workExperience' },

            {
                $lookup: {
                    from: 'skills',
                    localField: 'workExperience.skillsUsed',
                    foreignField: '_id',
                    as: 'skillDetails'
                }
            },
            {
                $addFields: {
                    'workExperience.skillsUsed': {
                        $map: {
                            input: '$skillDetails',
                            as: 'skill',
                            in: { _id: '$$skill._id', name: '$$skill.name' }
                        }
                    }
                }
            },
            {
                $replaceRoot: { newRoot: '$workExperience' }
            },
            {
                $sort: {
                    currentEmployment: -1,
                    joiningDate: -1
                }
            }
        ]);

        return result || [];
    },

    getCandidateEducations: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return [];
        }

        const result = await userModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id),
                    role: 'candidate'
                }
            },
            {
                $addFields: {
                    profile: { $ifNull: ['$profile', {}] }
                }
            },
            {
                $unwind: {
                    path: '$profile.education',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'profile.education.course',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            {
                $lookup: {
                    from: 'specializations',
                    localField: 'profile.education.specialization',
                    foreignField: '_id',
                    as: 'specialization'
                }
            },
            {
                $addFields: {
                    'profile.education.course': { $arrayElemAt: ['$course.name', 0] },
                    'profile.education.specialization': { $arrayElemAt: ['$specialization.name', 0] }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    education: { $push: '$profile.education' }
                }
            },
            {
                $project: {
                    _id: 0,
                    education: 1
                }
            }
        ])

        return result[0].education || [];

    },

    getCandidateCareerPreference: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        const result = await userModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id),
                    role: 'candidate',
                },
            },
            {
                $addFields: {
                    profile: { $ifNull: ['$profile', {}] },
                },
            },
            {
                $lookup: {
                    from: 'industries',
                    localField: 'profile.preferredIndustry',
                    foreignField: '_id',
                    as: 'preferredIndustry',
                },
            },
            {
                $lookup: {
                    from: 'jobcategories',
                    localField: 'profile.preferredJobCategory',
                    foreignField: '_id',
                    as: 'preferredJobCategory',
                },
            },
            {
                $lookup: {
                    from: 'locations',
                    localField: 'profile.preferredLocations',
                    foreignField: '_id',
                    as: 'preferredLocations',
                },
            },
            {
                $project: {
                    _id: 0,
                    preferredIndustry: { $arrayElemAt: ['$preferredIndustry', 0] },
                    preferredJobCategory: { $arrayElemAt: ['$preferredJobCategory', 0] },
                    preferredWorkMode: '$profile.preferredWorkMode',
                    prefferedShift: '$profile.prefferedShift',
                    preferredLocations: 1,
                },
            }
        ])

        return result[0] || null;

    },

    getCandidateResume: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;

        const result = await userModel.findOne(
            { _id: id, role: 'candidate' },
            { 'profile.resume': 1 }
        ).lean();

        return result?.profile?.resume || null;
    },

    getCandidateProjects: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) return [];

        const result = await userModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id),
                    role: 'candidate',
                },
            },
            {
                $addFields: {
                    profile: { $ifNull: ['$profile', {}] },
                },
            },
            {
                $project:{
                    projects:'$profile.projects'
                }
            }
        ])

        return result[0].projects || [];
    },

    updateCandidateSkills: async (id, data) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        return await userModel.findOneAndUpdate({ _id: id, role: 'candidate' }, {
            'profile.skills': data
        }, { new: true, runValidators: true, projection: { 'profile.skills': 1 } });
    },

    addCandidateEducation: async (id, data) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        const candidate = await userModel.findOne({ _id: id, role: 'candidate' });

        // if (!candidate.profile) {
        //     candidate.profile = { education: [data] };
        // } else if (!Array.isArray(candidate.profile.education)) {
        //     candidate.profile.education = [data];
        // } else {
        //     candidate.profile.education.push(data);
        // }

        if (!candidate.profile) {
            candidate.profile = {}
        }

        if (!candidate.profile.education) {
            candidate.profile.education = []
        }

        candidate.profile.education.push(data);

        await candidate.save();

        return candidate;
    },

    deleteCandidateEducation: async (id, eduId) => {
        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(eduId)) {
            return null;
        }

        return await userModel.findByIdAndUpdate(id, {
            $pull: { 'profile.education': { _id: eduId } }
        }, { new: true });
    },

    addCandidateWorkExperience: async (id, data) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const candidate = await userModel.findOne({ _id: id, role: 'candidate' });

        if (!candidate.profile) {
            candidate.profile = {};
        }
        if (!candidate.profile.workExperience) {
            candidate.profile.workExperience = [];
        }

        candidate.profile.workExperience.push(data);
        await candidate.save();

        return candidate;
    },

    deleteCandidateWorkExperience: async (id, workExpId) => {
        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(workExpId)) {
            return null;
        }

        return await userModel.findByIdAndUpdate(id, {
            $pull: { 'profile.workExperience': { _id: workExpId } }
        }, { new: true });
    },

    addCandidateProject: async (id, data) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const candidate = await userModel.findOne({ _id: id, role: 'candidate' });

        if (!candidate.profile) {
            candidate.profile = {};
        }
        if (!candidate.profile.projects) {
            candidate.profile.projects = [];
        }

        candidate.profile.projects.push(data);
        await candidate.save();

        return candidate;
    },

    deleteCandidateProject: async (id, projectId) => {
        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(projectId)) {
            return null;
        }

        return await userModel.findByIdAndUpdate(id, {
            $pull: { 'profile.projects': { _id: projectId } }
        }, { new: true });
    },

    updateCareerPreferences: async (id, data) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        const { preferredIndustry, preferredJobCategory, preferredWorkMode, prefferedShift, preferredLocations } = data;

        const candidate = await userModel.findOne({ _id: id, role: 'candidate' });

        if (!candidate.profile) {
            candidate.profile = {};
        }

        candidate.profile.preferredIndustry = preferredIndustry;
        candidate.profile.preferredJobCategory = preferredJobCategory;
        candidate.profile.preferredWorkMode = preferredWorkMode;
        candidate.profile.prefferedShift = prefferedShift;
        candidate.profile.preferredLocations = preferredLocations;

        await candidate.save();

        return candidate;

    },

    // getCandidateCareerPreference: async (id) => {
    //     if (!mongoose.Types.ObjectId.isValid(id)) {
    //         return null;
    //     }
    //     const result = await userModel.aggregate([
    //         { $match: { _id: new mongoose.Types.ObjectId(id) } },

    //         // Lookup for preferred locations
    //         {
    //             $lookup: {
    //                 from: 'locations',
    //                 localField: 'profile.preferredLocations',
    //                 foreignField: '_id',
    //                 as: 'profile.preferredLocationDetails'
    //             }
    //         },

    //         // Lookup for preferred industry
    //         {
    //             $lookup: {
    //                 from: 'industries',
    //                 localField: 'profile.preferredIndustry',
    //                 foreignField: '_id',
    //                 as: 'preferredIndustryData'
    //             }
    //         },
    //         { $unwind: { path: "$preferredIndustryData", preserveNullAndEmptyArrays: true } },

    //         {
    //             $lookup: {
    //                 from: 'jobcategories',
    //                 localField: 'profile.preferredJobCategory',
    //                 foreignField: '_id',
    //                 as: 'preferredJobCategoryData'
    //             }
    //         },
    //         { $unwind: { path: "$preferredJobCategoryData", preserveNullAndEmptyArrays: true } },

    //         {
    //             $project: {
    //                 _id: 0,
    //                 'profile.preferredWorkMode': 1,
    //                 'profile.prefferedShift': 1,
    //                 'profile.preferredLocationDetails': 1,

    //                 'profile.preferredIndustry': {
    //                     _id: "$preferredIndustryData._id",
    //                     name: "$preferredIndustryData.name"
    //                 },
    //                 'profile.preferredJobCategory': {
    //                     _id: "$preferredJobCategoryData._id",
    //                     name: "$preferredJobCategoryData.name"
    //                 }
    //             }
    //         }
    //     ]);

    //     return result[0] || null;

    // },

    updateResume: async (id, data) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        const candidate = await userModel.findOne({ _id: id, role: 'candidate' });

        if (!candidate) return null;

        if (!candidate.profile) {
            candidate.profile = {};
        }

        if (!candidate.profile.resume) {
            candidate.profile.resume = {};
        }

        console.log(data);
        candidate.profile.resume.path = data.path;
        candidate.profile.resume.originalName = data.originalName;

        await candidate.save();
        return candidate;
    },

    getCandidatesPaginated: async (options, filters = {}) => {
        const { page, limit } = options;

        const skip = (page - 1) * limit;

        const matchConditions = { role: 'candidate', isRemoved: false };

        if (filters.status) {
            matchConditions.isActive = filters.status === 'true';
        }
        if (filters.search) {
            matchConditions.name = { $regex: filters.search, $options: 'i' };
        }


        const result = await userModel.aggregate([
            {
                $match: matchConditions
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    profilePicture: 1,
                    isActive: 1,
                    isRemoved: 1,
                    createdAt: 1
                }
            },
            {
                $facet: {
                    totalCount: [
                        { $count: 'count' }
                    ],
                    paginatedResults: [
                        { $skip: skip },
                        { $limit: limit }
                    ]
                }
            }
        ])

        const candidates = result[0].paginatedResults;
        const totalCount = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
        const totalPages = Math.ceil(totalCount / limit);

        return { candidates, totalCount, totalPages }

    },

    activateCandidate: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const updatedCandidate = await userModel.findOneAndUpdate({ _id: id, role: 'candidate' }, { isActive: true }, { new: true });

        return updatedCandidate;
    },
    deactivateCandidate: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const updatedCandidate = await userModel.findOneAndUpdate({ _id: id, role: 'candidate' }, { isActive: false }, { new: true });
        return updatedCandidate;
    },
    removeCandidate: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const updatedCandidate = await userModel.findOneAndUpdate({ _id: id, role: 'candidate' }, { isRemoved: true }, { new: true });
        return updatedCandidate;
    },

    getCandidatesWorkExperienceSplit: async () => {
        const workStatusSplit = await userModel.aggregate([
            {
                $match: {
                    role: 'candidate',
                    isRemoved: false
                }
            },
            {
                $project: {
                    workstatus: { $ifNull: ['$profile.workstatus', 'unknown'] }
                }
            },
            {
                $group: {
                    _id: '$workstatus',
                    count: { $sum: 1 }
                }
            },
            //   {
            //     $match: {
            //       _id: { $in: ['fresher', 'experienced'] } 
            //     }
            //   }
            {
                $project: {
                    _id: 0,
                    status: '$_id',
                    count: 1
                }
            }
        ]);

        return workStatusSplit;

    },

    


}

module.exports = candidateRepositories;