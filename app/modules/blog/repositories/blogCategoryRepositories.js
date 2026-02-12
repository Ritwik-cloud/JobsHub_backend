const blogCategoryModel = require('../model/blogCategoryModel');
const mongoose = require('mongoose');

const blogCategoryRepositories = {
    addBlogCategory: async (data) => {
        const { name } = data;
        const blogCategory = new blogCategoryModel({
            name
        })
        await blogCategory.save();
        return blogCategory;
    },
    findBlogCategoryByname: async (name) => {
        return await blogCategoryModel.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } })
    },

    getAllBlogCategories: async () => {
        return await blogCategoryModel.find({});
    },

    getBlogCategoryById: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await blogCategoryModel.findById(id);
    },

    updateBlogCategory: async (id, data) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const { name } = data;
        return await blogCategoryModel.findByIdAndUpdate(id, { name }, { new: true, runValidators: true });
    },

    deleteBlogCategory:async(id)=>{
         if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        return await blogCategoryModel.findByIdAndDelete(id);
    }
}

module.exports = blogCategoryRepositories;