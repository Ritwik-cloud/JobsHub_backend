const userModel = require("../../user/model/userModel");
const companyModel = require("../model/companyModel");
const jobModel = require("../../job/model/jobModel");

const mongoose = require('mongoose')


const companyRepositories = {
    findCompanyByname: async (name) => {
        return await companyModel.find({ name: { $regex: new RegExp(name, 'i') }}).select('name');
    },

    checkCompanyExistByName: async (name) => {
        const existingCompanyByName = await companyModel.findOne({ name: new RegExp(`^${name}$`, 'i') });
        return existingCompanyByName;
    },

    getCompanyDetailsByUserId: async (userId) => {
        const result = await userModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(userId) }
            },
            {
                $lookup: {
                    from: 'companies',
                    localField: 'company',
                    foreignField: '_id',
                    as: 'companyDetails'
                }
            },
            {
                $unwind: {
                    path: '$companyDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    companyDetails: 1,
                    _id: 0
                }
            }
        ])

        return result.length > 0 ? result[0].companyDetails : {};
    },

    getCompanyById: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return companyModel.findById(id);
    },

    updateCompany: async (id, data) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await companyModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    },

    getCompanyByRecruiterId: async (recruiterId) => {
        if (!mongoose.Types.ObjectId.isValid(recruiterId)) {
            return null;
        }
        return companyModel.findOne({ recruiters: recruiterId });
    },

    getAllCompanies: async (options = {},filters={}) => {
        const { page = 1, limit = 10 } = options;

        const skip = (page - 1) * limit;

        const matchConditions = {};

        if (filters.status) {
            matchConditions.isActive = filters.status === 'true';
        }
        if (filters.search) {
            matchConditions.name = { $regex: filters.search, $options: 'i' };
        }

        const result = await companyModel.aggregate([
            {
                $match: matchConditions
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'creatorInfo'
                }
            },

            {
                $unwind: { path: '$creatorInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    name: 1,
                    website: 1,
                    logo: 1,
                    email: 1,
                    isActive: 1,
                    createdBy: {
                        _id: '$creatorInfo._id',
                        name: '$creatorInfo.name',
                        email: '$creatorInfo.email'
                    },
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

        const companies = result[0].paginatedResults;
        const totalCount = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
        const totalPages = Math.ceil(totalCount / limit);

        return { companies, totalCount, totalPages }

    },

    activateCompany: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const updatedCompany = await companyModel.findByIdAndUpdate(id, { isActive: true }, { new: true, runValidators: true });

        if(updatedCompany){
            await userModel.findOneAndUpdate({ _id: updatedCompany.createdBy, role: 'recruiter' }, {
                $set: { 'recruiterProfile.isActive': true }
            })
        }

        return updatedCompany;

    },

     deactivateCompany: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const updatedCompany = await companyModel.findByIdAndUpdate(id, { isActive: false }, { new: true, runValidators: true });

        if(updatedCompany){
            await userModel.updateMany({ company:id, role: 'recruiter' }, {
                $set: { 'recruiterProfile.isActive': false }
            })

            await jobModel.updateMany({company:id,status:'active'},
                {
                    $set:{status:'inactive'}
                }
            )
            
        }

        return updatedCompany;

    }
}

module.exports = companyRepositories;