const jobCategoryModel = require('../model/jobCategoryModel');
const jobModel = require('../../job/model/jobModel');
const mongoose = require('mongoose');
const userModel = require('../../user/model/userModel');

const jobCategoryRepositories = {
    addJobCatgory: async (data) => {
        const { name, normalized } = data;
        const jobCategory = new jobCategoryModel({
            name,
            normalized
        })

        await jobCategory.save();
        return jobCategory;
    },

    getJobCategoryByIndustryAndNormalizedName: async (industry, normalized) => {
        if (!mongoose.Types.ObjectId.isValid(industry)) {
            return null;
        }
        return await jobCategoryModel.findOne({ industry, normalized });
    },

    getAllJobCategories: async () => {
        return jobCategoryModel.find({});
    },
    getJobCategoryById: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await jobCategoryModel.findById(id);
    },

    updateJobCategory: async (id, data) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const { name, normalized } = data;
        console.log(data);
        return await jobCategoryModel.findByIdAndUpdate(id, { name, normalized }, { new: true, runValidators: true });
    },

    deleteJobCategory: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await jobCategoryModel.findByIdAndDelete(id);
    },

    getJobCategoriesByIndustryId: async (industryId) => {
        if (!mongoose.Types.ObjectId.isValid(industryId)) {
            return null;
        }

        return await jobCategoryModel.find({ industry: industryId });
    },

    getJobCategoriesInJobs: async () => {

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const jobCategoriesInuse = await jobModel.aggregate([
            {
                $match: { status: 'active', isDeleted: false, applicationDeadline: { $gte: today } }
            },
            {
                $group: {
                    _id: '$jobCategory',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'jobcategories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            { $unwind: '$categoryDetails' },
            {
                $project: {
                    _id: 0,
                    categoryId: '$_id',
                    name: '$categoryDetails.name',
                    count: 1
                }
            },
            { $sort: { count: -1 } }
        ]);

        return jobCategoriesInuse;

    },

    isJobCategoryUsed: async (jobCategoryId) => {
        if (!mongoose.Types.ObjectId.isValid(jobCategoryId)) {
            return false;
        }

        const usedByUser = await userModel.findOne(
            { 'profile.preferredJobCategory': jobCategoryId },
            { _id: 1 }
        );

        if (usedByUser) {
            return true;
        }

        const usedByJob = await jobModel.findOne(
            { jobCategory: jobCategoryId },
            { _id: 1 }
        );

        if (usedByJob) {
            return true;
        }

        return false;
    }


}



module.exports = jobCategoryRepositories