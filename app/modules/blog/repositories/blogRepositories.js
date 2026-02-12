const blogModel = require('../model/blogModel');
const mongoose = require('mongoose');

const blogRepositories = {

    addBlog: async (data) => {
        const blog = new blogModel({
            ...data
        })
        await blog.save();
        return blog;
    },

    getAllBlogsWithPaginationAndFilter: async (options, filters = {},) => {
        const { page, limit} = options;
        const skip = (page - 1) * limit;

        const matchConditions = {};

        if (filters.status) {
            matchConditions.status = filters.status;
        }

        if (filters.category) {
            matchConditions.category = new mongoose.Types.ObjectId(filters.category);
        }

        if (filters.search) {
            matchConditions.title = { $regex: filters.search, $options: 'i' };
        }

        const result = await blogModel.aggregate([
            {
                $match: matchConditions
            },
            {
                $lookup: {
                    from: 'blogcategories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $unwind: {
                    path: '$categoryInfo', preserveNullAndEmptyArrays: true
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    title: 1,
                    slug: 1,
                    content: 1,
                    category: {
                        _id: '$categoryInfo._id', name: '$categoryInfo.name'
                    },
                    coverImage: 1,
                    status: 1,
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

        const blogs = result[0].paginatedResults;
        const totalCount = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
        const totalPages = Math.ceil(totalCount / limit);

        return { blogs, totalCount, totalPages }

    },

    getBlogById: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        const blog = await blogModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(id) }
            },
            {
                $lookup: {
                    from: 'blogcategories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $unwind: {
                    path: '$categoryInfo', preserveNullAndEmptyArrays: true
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    title: 1,
                    slug: 1,
                    content: 1,
                    category: {
                        _id: '$categoryInfo._id', name: '$categoryInfo.name'
                    },
                    coverImage: 1,
                    status: 1,
                    createdAt: 1
                }
            }
        ])

        return blog[0] || null;

    },

    updateBlog: async (id, data) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        return await blogModel.findByIdAndUpdate(id, { ...data }, { new: true, runValidators: true });
    },

    deleteBlog: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        return await blogModel.findByIdAndDelete(id);
    },

    getPublicBlogs: async (options = {}, filters = {}) => {
        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;

        const matchConditions = {
            status: 'active'
        };

        if (filters.category) {
            matchConditions.category = new mongoose.Types.ObjectId(filters.category);
        }

        if (filters.search) {
            matchConditions.title = { $regex: filters.search, $options: 'i' };
        }

        const result = await blogModel.aggregate([
            {
                $match: matchConditions
            },
            {
                $lookup: {
                    from: 'blogcategories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $unwind: {
                    path: '$categoryInfo', preserveNullAndEmptyArrays: true
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    title: 1,
                    slug: 1,
                    content: 1,
                    category: {
                        _id: '$categoryInfo._id', name: '$categoryInfo.name'
                    },
                    coverImage: 1,
                    status: 1,
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

        const blogs = result[0].paginatedResults;
        const totalCount = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
        const totalPages = Math.ceil(totalCount / limit);

        return { blogs, totalCount, totalPages }
    },

    getLatestBlogs: async (excludeId, noOfblogs) => {
        const latestBlogs = await blogModel.find({
            _id: { $ne: excludeId },
            status: 'active'
        })
            .sort({ createdAt: -1 })
            .limit(noOfblogs);
        return latestBlogs;
    },

    getBlogsBycategory: async (categoryId) => {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return null;
        }

        return await blogModel.find({ category: categoryId });
    },

    getCurrentBlogs: async (noOfblogs) => {
        const blogs = await blogModel.aggregate([
            {
                $match: { status: 'active' }
            },
            {
                $lookup: {
                    from: 'blogcategories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $unwind: {
                    path: '$categoryInfo', preserveNullAndEmptyArrays: true
                }
            },
            { $sort: { createdAt: -1 } },
            { $limit: noOfblogs },
            {
                $project: {
                    title: 1,
                    slug: 1,
                    content: 1,
                    category: {
                        _id: '$categoryInfo._id', name: '$categoryInfo.name'
                    },
                    coverImage: 1,
                    status: 1,
                    createdAt: 1
                }
            }
        ])

        return blogs;
    }


}

module.exports = blogRepositories;