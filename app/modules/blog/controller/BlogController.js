const blogCategoryRepositories = require("../repositories/blogCategoryRepositories");
const blogRepositories = require("../repositories/blogRepositories");
const { blogValidationSchema } = require('../validation/blogValidationSchema');
const slugify = require('slugify');
const fs = require('fs').promises;

class BlogController {
    async manageBlogPage(req, res) {
        try {
            const blogCategories = await blogCategoryRepositories.getAllBlogCategories();
            return res.render('admin/manage-blog', { title: 'Manage Blog', blogCategories });
        } catch (error) {
            console.log(error);
        }
    }

    async addBlogPage(req, res) {
        try {
            const blogCategories = await blogCategoryRepositories.getAllBlogCategories();
            return res.render('admin/add-blog', { title: 'Add Blog', blogCategories });
        } catch (error) {
            console.log(error);
        }
    }

    async addBlog(req, res) {
        try {
            const { error, value } = blogValidationSchema.validate(req.body, { abortEarly: false });
            if (error) {
                // console.log(error);
                const errors = {};
                error.details.forEach(err => {
                    errors[err.path[0]] = err.message;
                });
                return res.status(400).json({
                    status: false,
                    errors
                });
            }

            const { title, content, category } = value;

            const categoryExists = await blogCategoryRepositories.getBlogCategoryById(category);
            if (!categoryExists) {
                return res.status(400).json({
                    status: false,
                    errors: {
                        category: 'Blog category is not found.'
                    }
                })
            }

            if (!req.file) {
                return res.status(400).json({
                    status: false,
                    errors: {
                        coverImage: 'Cover image is required.'
                    }
                })
            }

            const coverImagePath = `uploads/blog/${req.file.filename}`;

            const newBlog = await blogRepositories.addBlog({
                title,
                content,
                category,
                slug: slugify(title, { lower: true, strict: true }),
                coverImage: coverImagePath
            })

            return res.status(201).json({
                status: true,
                message: 'Blog has been added successfully'
            })


        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getAllBlogsPaginated(req, res) {
        try {
            const { page = 1, limit = 10, search, category, status } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
            }

            const filters = {
                status,
                category,
                search
            }

            const { blogs, totalCount, totalPages } = await blogRepositories.getAllBlogsWithPaginationAndFilter(options, filters);



            return res.status(200).json({
                status: true,
                message: 'Blogs has been fetched successfully',
                data: blogs,
                totalRecords: totalCount,
                page: parseInt(page),
                totalPages: totalPages
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getEditBlogPage(req, res) {
        try {
            const blogCategories = await blogCategoryRepositories.getAllBlogCategories();
            const id = req.params.id;
            const blog = await blogRepositories.getBlogById(id);

            if (!blog) {
                return res.redirect('/admin/blogpage')
            }

            return res.render('admin/edit-blog', { title: 'Edit Blog', blogCategories, blog });
        } catch (error) {
            console.log(error);
        }
    }

    async updateBlog(req, res) {
        try {
            const id = req.params.id;

            const blog = await blogRepositories.getBlogById(id);
            if (!blog) {
                return res.status(400).json({
                    status: false,
                    message: 'Blog is not found'
                })
            }

            const { error, value } = blogValidationSchema.validate(req.body, { abortEarly: false });
            if (error) {
                console.log(error);
                const errors = {};
                error.details.forEach(err => {
                    errors[err.path[0]] = err.message;
                });
                return res.status(400).json({
                    status: false,
                    errors
                });
            }

            const { title, content, category } = value;

            const categoryExists = await blogCategoryRepositories.getBlogCategoryById(category);
            if (!categoryExists) {
                return res.status(400).json({
                    status: false,
                    errors: {
                        category: 'Blog category is not found.'
                    }
                })
            }

            const coverImagePath = req.file ? `uploads/blog/${req.file.filename}` : blog.coverImage;

            const updatedBlog = await blogRepositories.updateBlog(id, {
                title,
                content,
                category,
                slug: slugify(title, { lower: true, strict: true }),
                coverImage: coverImagePath
            })

            if (!updatedBlog) {
                return res.status(400).json({
                    status: false,
                    message: 'Blog is not found'
                })
            }

            if (req.file && blog.coverImage) {
                try {
                    await fs.access(blog.coverImage)
                    await fs.unlink(blog.coverImage);
                } catch (error) {
                    if (error.code !== 'ENOENT') {
                        console.error('Error deleting old image:', error);
                    }
                }

            }

            return res.status(200).json({
                status: true,
                message: "Blog has been updated successfully.",
                data: updatedBlog
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async updateBlogStatus(req, res) {
        try {
            const id = req.params.id;
            const status = req.body.status;

            const updatedBlog = await blogRepositories.updateBlog(id, { status: status });

            if (!updatedBlog) {
                return res.status(400).json({
                    status: false,
                    message: 'Blog is not found'
                })
            }

            return res.status(200).json({
                status: true,
                message: "Blog status has been updated successfully.",
                blogStatus: updatedBlog.status
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async deleteBlog(req, res) {
        try {
            const id = req.params.id;

            const blog = await blogRepositories.getBlogById(id);
            if (!blog) {
                return res.status(400).json({
                    status: false,
                    message: 'Blog is not found'
                })
            }

            const deletedBlog = await blogRepositories.deleteBlog(id);

            if (!deletedBlog) {
                return res.status(400).json({
                    status: false,
                    message: 'Blog is not found'
                })
            }

            if (blog.coverImage) {
                try {
                    await fs.access(blog.coverImage)
                    await fs.unlink(blog.coverImage);
                } catch (error) {
                    if (error.code !== 'ENOENT') {
                        console.error('Error deleting old image:', error);
                    }
                }

            }

            return res.status(200).json({
                status: true,
                message: 'Blog has been deled successfully'
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getPublicBlogPage(req, res) {
        try {
            const blogCategories = await blogCategoryRepositories.getAllBlogCategories();
            return res.render('home/blog-list', { title: 'Blogs', blogCategories })
        } catch (error) {
            console.log(error);
        }
    }

    async getBlogs(req, res) {
        try {
            const { page = 1, limit = 10, search, category } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
            }

            const filters = {
                category,
                search
            }

            const { blogs, totalCount, totalPages } = await blogRepositories.getPublicBlogs(options, filters);

            // console.log(blogs);

            return res.status(200).json({
                status: true,
                message: 'Blogs has been fetched successfully',
                data: blogs,
                totalRecords: totalCount,
                page: parseInt(page),
                totalPages: totalPages
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getPublicBlogDetailPage(req, res) {
        try {
            const id = req.params.id;

            const blog = await blogRepositories.getBlogById(id);

            if (!blog) {
                return res.redirect('/blogs/page');
            }

            const latestBlogs=await blogRepositories.getLatestBlogs(id,5);

            return res.render('home/blog-detail',{title:'Blog Detail',blog,latestBlogs})
           
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

     async getCandidateBlogPage(req, res) {
        try {
            const blogCategories = await blogCategoryRepositories.getAllBlogCategories();
            return res.render('candidate/blog-list', { title: 'Blogs', blogCategories })
        } catch (error) {
            console.log(error);
        }
    }

     async getCandidateBlogDetailPage(req, res) {
        try {
            const id = req.params.id;

            const blog = await blogRepositories.getBlogById(id);

            if (!blog) {
                return res.redirect('/candidate/blogs/page');
            }

            const latestBlogs=await blogRepositories.getLatestBlogs(id,5);

            return res.render('candidate/blog-detail',{title:'Blog Detail',blog,latestBlogs})
           
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

}

module.exports = new BlogController();