const blogCategoryRepositories = require("../modules/blog/repositories/blogCategoryRepositories");
const Joi = require('joi');
const blogRepositories = require("../modules/blog/repositories/blogRepositories");

class BlogCategoryController {
    

    async addBlogCategory(req, res) {
        try {
            const blogCategoryValidation = Joi.object({
                name: Joi.string().trim().required().messages({
                    'string.empty': 'Blog category name is required.',
                    'any.required': 'Blog category name is required.'
                })
            })

            const { error, value } = blogCategoryValidation.validate(req.body, { abortEarly: false });
            if (error) {
                const errors = {};
                error.details.forEach(err => {
                    errors[err.path[0]] = err.message;
                });
                return res.status(400).json({
                    status: false,
                    errors
                });
            }

            const { name } = value;


            const isPresent = await blogCategoryRepositories.findBlogCategoryByname(name);
            if (isPresent) {
                return res.status(400).json({
                    status: false,
                    errors: { name: 'Blog category name is already present.' }
                });
            }

            const newBlogCategory = await blogCategoryRepositories.addBlogCategory({ name });

            return res.status(201).json({
                status: true,
                message: 'Blog category name is saved.',
                data: newBlogCategory
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getAllBlogCategories(req, res) {
        try {
            const categories = await blogCategoryRepositories.getAllBlogCategories();
            return res.status(200).json({
                status: true,
                message: 'Blog categories fetched successfully.',
                data: categories
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getBlogCategory(req, res) {
        try {
            const category = await blogCategoryRepositories.getBlogCategoryById(req.params.id);
            if (!category) {
                return res.status(404).json({
                    status: false,
                    message: 'Blog category is not found.'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Blog category has been fetched successfully',
                data: category
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async updateBlogCategory(req, res) {
        try {
            const blogCategoryValidation = Joi.object({
                name: Joi.string().trim().required().messages({
                    'string.empty': 'Blog category name is required.',
                    'any.required': 'Blog category name is required.'
                })
            })

            const { error, value } = blogCategoryValidation.validate(req.body, { abortEarly: false });
            if (error) {
                const errors = {};
                error.details.forEach(err => {
                    errors[err.path[0]] = err.message;
                });
                return res.status(400).json({
                    status: false,
                    errors
                });
            }

            const { name } = value;

            const updatedCategory = await blogCategoryRepositories.updateBlogCategory(req.params.id, { name });
            if (!updatedCategory) {
                return res.status(404).json({
                    status: false,
                    message: 'Blog category is not found.'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Blog category has been updated successfully.'
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async deleteBlogCategory(req, res) {
        try {
            const id = req.params.id;

            const blogsBycategory = await blogRepositories.getBlogsBycategory(id);

            if (blogsBycategory.length > 0) {
                return res.status(400).json({
                    status: false,
                    message: 'Blog category can not be delete. One or more blogs are using this blog category'
                })
            }

            const deletedBlogCategory = await blogCategoryRepositories.deleteBlogCategory(id);
            if(!deletedBlogCategory){
                 return res.status(404).json({
                status: false,
                message: 'Blog category is not found'
            })
            }


            return res.status(200).json({
                status: true,
                message: 'Blog category deleted successfully'
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

module.exports = new BlogCategoryController();