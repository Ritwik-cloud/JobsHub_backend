const industryRepositories = require("../modules/predefined_data/repositories/industryRepositories");
const jobCategoryRepositories = require("../modules/predefined_data/repositories/jobcategoryRepositories");
const Joi = require('joi');
const companyRepositories = require("../modules/company/repositories/companyRepositories");
const jobRepositories = require("../modules/job/repositories/JobRepositories");
const { jobValidationSchema } = require("../modules/job/validation/jobValidationSchema");
const locationRepositories = require("../modules/predefined_data/repositories/locationRepositories");
const skillRepositories = require("../modules/predefined_data/repositories/skillRepositories");
const mongoose = require('mongoose');
const slugify = require('slugify');
const recruiterRepositories = require("../modules/recruiter/repositories/recruiterRepositories");
const applicationRepositories = require("../modules/application/repositories/applicationRepositories");


function timeAgo(createdAt) {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffMs = now - createdDate;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
        return `Just now`;
    }
}

class JobController {
    

    async createJob(req, res) {
        try {
            const {
                title, description, location, industry, jobCategory, jobType,
                workMode, experienceLevel, minimumExperience, maximumExperience, // These are now required
                minimumSalary, maximumSalary, skillsRequired, applicationDeadline, vacancies
            } = req.body;

            const userId = req.user._id;
            const existCompany = await companyRepositories.getCompanyByRecruiterId(userId);
            if (!existCompany) {
                return res.status(404).json({
                    status: false,
                    message: 'Company is not found'
                })
            }

            const companyId = existCompany._id;

            // console.log(existCompany);
            // console.log('user', userId);

            const dataToValidate = {
                title,
                description,
                location,
                industry,
                jobCategory,
                jobType,
                workMode,
                experienceLevel: experienceLevel ? experienceLevel : null,
                minimumExperience: minimumExperience,
                maximumExperience: maximumExperience === '' ? null : maximumExperience,
                minimumSalary: minimumSalary === '' ? null : minimumSalary,
                maximumSalary: maximumSalary === '' ? null : maximumSalary,
                skillsRequired: skillsRequired,
                applicationDeadline,
                vacancies: vacancies === '' ? null : vacancies,
                company: companyId.toString(),
                postedBy: userId.toString()
            };

            // console.log(dataToValidate);

            const { error, value } = jobValidationSchema.validate(dataToValidate, { abortEarly: false });
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



            if (value.maximumExperience !== null && value.minimumExperience > value.maximumExperience) {
                return res.status(400).json({
                    status: false,
                    errors: {
                        minimumExperience: 'Minimum experience cannot exceed maximum experience.'
                    }
                })
            }

            const selectedDate = new Date(value.applicationDeadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);

            const maxAllowedDate = new Date(today);
            maxAllowedDate.setDate(today.getDate() + 30);

            if (selectedDate > maxAllowedDate) {
                return res.status(400).json({
                    status: false,
                    errors: {
                        applicationDeadline: 'Application deadline cannot be more than 30 days from today.'
                    }
                });
            }


            const newJobPost = await jobRepositories.createJob({
                title: value.title,
                slug: slugify(value.title, { lower: true, strict: true }),
                description: value.description,
                company: value.company,
                postedBy: value.postedBy,
                location: value.location,
                industry: value.industry,
                jobCategory: value.jobCategory,
                jobType: value.jobType,
                workMode: value.workMode,
                experienceLevel: value.experienceLevel,
                minimumExperience: value.minimumExperience,
                maximumExperience: value.maximumExperience,
                minimumSalary: value.minimumSalary,
                maximumSalary: value.maximumSalary,
                skillsRequired: value.skillsRequired,
                applicationDeadline: new Date(value.applicationDeadline),
                vacancies: value.vacancies
            })

            return res.status(201).json({
                status: true,
                message: 'Job has been created successfully'
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    // async getEditJobPage(req, res) {
    //     try {
    //         const industries = await industryRepositories.getAllIndustries();
    //         const jobCategories = await jobCategoryRepositories.getAllJobCategories();

    //         const id = req.params.id;

    //         const job = await jobRepositories.getJobById(id);

    //         if (!job) {
    //             return res.recruiter('/recruiter/jobs/list');
    //         }

    //         return res.render('recruiter/job-edit', { industries, jobCategories, job, title: 'Post Edit' })
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    async updateJob(req, res) {
        try {
            const {
                title, description, location, industry, jobCategory, jobType,
                workMode, experienceLevel, minimumExperience, maximumExperience, // These are now required
                minimumSalary, maximumSalary, skillsRequired, applicationDeadline, vacancies
            } = req.body;

            const jobId = req.params.id;
            const userId = req.user._id;
            const existCompany = await companyRepositories.getCompanyByRecruiterId(userId);
            if (!existCompany) {
                return res.status(404).json({
                    status: false,
                    message: 'Company is not found'
                })
            }

            const companyId = existCompany._id;

            // console.log(existCompany);
            // console.log('user', userId);

            const dataToValidate = {
                title,
                description,
                location,
                industry,
                jobCategory,
                jobType,
                workMode,
                experienceLevel: experienceLevel ? experienceLevel : null,
                minimumExperience: minimumExperience,
                maximumExperience: maximumExperience === '' ? null : maximumExperience,
                minimumSalary: minimumSalary === '' ? null : minimumSalary,
                maximumSalary: maximumSalary === '' ? null : maximumSalary,
                skillsRequired: skillsRequired,
                applicationDeadline,
                vacancies: vacancies === '' ? null : vacancies,
                company: companyId.toString(),
                postedBy: userId.toString()
            };

            // console.log(dataToValidate);

            const { error, value } = jobValidationSchema.validate(dataToValidate, { abortEarly: false });
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

            if (value.maximumExperience !== null && value.minimumExperience > value.maximumExperience) {
                return res.status(400).json({
                    status: false,
                    errors: {
                        minimumExperience: 'Minimum experience cannot exceed maximum experience.'
                    }
                })
            }

            const job = await jobRepositories.findJobById(jobId);
            if (!job) {
                return res.status(404).json({
                    status: false,
                    message: 'Job is not found'
                })
            }

            const createdDate = new Date(job.createdAt);
            createdDate.setHours(0, 0, 0, 0);

            const maxAllowedDeadline = new Date(createdDate);
            maxAllowedDeadline.setDate(maxAllowedDeadline.getDate() + 30);
            maxAllowedDeadline.setHours(23, 59, 59, 999);

            const selectedDate = new Date(value.applicationDeadline);
            selectedDate.setHours(0, 0, 0, 0);

            if (selectedDate > maxAllowedDeadline) {
                return res.status(400).json({
                    status: false,
                    errors: {
                        applicationDeadline: 'Deadline cannot be more than 30 days from original post date.'
                    }
                });
            }

            const updatedJob = await jobRepositories.updateJob(jobId, {
                title: value.title,
                slug: slugify(value.title, { lower: true, strict: true }),
                description: value.description,
                company: value.company,
                postedBy: value.postedBy,
                location: value.location,
                industry: value.industry,
                jobCategory: value.jobCategory,
                jobType: value.jobType,
                workMode: value.workMode,
                experienceLevel: value.experienceLevel,
                minimumExperience: value.minimumExperience,
                maximumExperience: value.maximumExperience,
                minimumSalary: value.minimumSalary,
                maximumSalary: value.maximumSalary,
                skillsRequired: value.skillsRequired,
                applicationDeadline: new Date(value.applicationDeadline),
                vacancies: value.vacancies
            })

            if (!updatedJob) {
                return res.status(404).json({
                    status: false,
                    message: 'Job is not found'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Job has been updated successfully',
                data: updatedJob
            })


        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    // async manageJobPage(req, res) {
    //     try {
    //         return res.render('recruiter/manage-jobs', { title: 'Manage Jobs' })
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    async getJobsPaginated(req, res) {
        try {
            const { page = 1, limit = 10, search, status } = req.query;
            const userId = req.user._id;
            const company = await companyRepositories.getCompanyByRecruiterId(userId);

            if (!company) {
                return res.status(404).json({
                    status: false,
                    message: 'Company is not found'
                })
            }

            // const skip = (parseInt(page) - 1) * parseInt(limit);
            // const limitVal = parseInt(limit);

            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };

            const filters = {
                search,
                status
            }

            const isCompanyAdminRecuiter = req.user.recruiterRole === 'admin_recruiter';

            const result = isCompanyAdminRecuiter
                ? await jobRepositories.getPaginatedJobsByCompany(company._id, options, filters)
                : await jobRepositories.getPaginatedJobsByRecruiterAndCompany(userId, company._id, options, filters);

            return res.status(200).json({
                status: true,
                message: 'Job has been fetched successfully',
                data: result.jobs,
                page: parseInt(page),
                totalPages: Math.ceil(result.totalJobs / limit)
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async updateJobStatus(req, res) {
        try {
            const userId = req.user._id;
            const jobId = req.params.id;
            const status = req.body.status;

            const recruiter = await recruiterRepositories.getRecruiterById(userId);

            const existCompany = await companyRepositories.getCompanyById(recruiter.company);
            if (!existCompany) {
                return res.status(404).json({
                    status: false,
                    message: 'Company is not found'
                })
            }

            // console.log(status);
            const updatedJobStatus = await jobRepositories.updateJob(jobId, { status: status });

            if (!updatedJobStatus) {
                return res.status(404).json({
                    status: false,
                    message: 'Job is not found'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Job status updated successfully',
                jobStatus: updatedJobStatus.status
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    // async getPublicJobPage(req, res) {
    //     try {
    //         const industries = await industryRepositories.getAllIndustries();
    //         const jobCategories = await jobCategoryRepositories.getAllJobCategories();
    //         const locations = await locationRepositories.getAllLocations();
    //         return res.render('home/job-find', { industries, jobCategories, locations, title: 'Jobs' });
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }


    async searchSkillAndTitleSuggestion(req, res) {
        try {
            const query = req.query.q?.toLowerCase() || '';
            if (!query) return res.json([]);

            const normalizedQuery = query.toLowerCase()
                .replace(/\s+/g, '')
                .replace(/[^a-z0-9+#]/g, '');

            // console.log(normalizedQuery);

            const skillMatches = await skillRepositories.getSkillsByNormalizedName(normalizedQuery)

            const jobMatches = await jobRepositories.findJobByTitle(query);

            // console.log(skillMatches);
            // console.log(jobMatches);

            const uniqueJobTitleMap = new Map();
            for (const job of jobMatches) {
                const key = job.title.trim().toLowerCase();
                if (!uniqueJobTitleMap.has(key)) {
                    uniqueJobTitleMap.set(key, job.title);
                }
            }

            const uniqueJobMatches = [...uniqueJobTitleMap.values()].map(title => ({
                type: 'job',
                label: title
            }));


            const suggestions = [
                ...skillMatches.map(skill => ({ type: 'skill', label: skill.name })),
                ...uniqueJobMatches
            ];

            return res.json(suggestions);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }


    async getPublicJobs(req, res) {
        try {
            console.log(req.query);
            const { page, search, experience, industry, jobCategory, jobType, workMode, location, postedTime } = req.query;


            const filters = {};
            const options = {
                page: parseInt(page) || 1,
                limit: 3,
                sortColumn: 'createdAt',
                sortDirection: 'desc'
            }


            if (experience !== undefined && experience !== null && experience !== '') {
                filters.experience = Number(experience);
            }
            if (jobType) {
                filters.jobType = Array.isArray(jobType) ? jobType : [jobType];
            }

            if (workMode) {
                filters.workMode = Array.isArray(workMode) ? workMode : [workMode];
            }

            if (industry) {
                filters.industry = Array.isArray(industry) ? industry.map(id => new mongoose.Types.ObjectId(id)) : [new mongoose.Types.ObjectId(industry)];
            }
            if (jobCategory) {
                filters.jobCategory = Array.isArray(jobCategory) ? jobCategory.map(id => new mongoose.Types.ObjectId(id)) : [new mongoose.Types.ObjectId(jobCategory)];
            }

            if (location) {
                filters.location = Array.isArray(location) ? location.map(id => new mongoose.Types.ObjectId(id)) : [new mongoose.Types.ObjectId(location)];
            }

            if (search) {
                filters.search = search;
            }

            if (postedTime) {
                filters.postedTime = parseInt(postedTime);
            }



            const { jobs, totalJobs, currentPage, totalPages } = await jobRepositories.getJobs(filters, options);

            return res.status(200).json({
                status: true,
                message: 'Jobs fetched successfully.',
                data: jobs,
                totalRecords: totalJobs,
                currentPage: currentPage,
                totalPages: totalPages
            });



        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getPublicJobDetail(req, res) {
        try {
            const jobId = req.params.id;
            const job = await jobRepositories.getDetailJobById(jobId);
            if (!job) {
                return res.status(404).json({
                    status: flase,
                    message: "Job is not found."
                })
            }

            const postedTimeAgo = timeAgo(job.createdAt);

            return res.status(200).json({
                status: true,
                message: 'Job has been fetched successfully',
                data: { job, postedTimeAgo }
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    // async getCandidateFindJobPage(req, res) {
    //     try {
    //         const industries = await industryRepositories.getAllIndustries();
    //         const jobCategories = await jobCategoryRepositories.getAllJobCategories();
    //         const locations = await locationRepositories.getAllLocations();
    //         return res.render('candidate/find-job-list', { industries, jobCategories, locations, title: 'Find Jobs' });
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    async getCandidateFindJobs(req, res) {
        try {
            console.log(req.query);
            const { page, search, experience, industry, jobCategory, jobType, workMode, location, postedTime } = req.query;

            const userId = req.user._id;

            const filters = {};
            const options = {
                page: parseInt(page) || 1,
                limit: 3,
                sortColumn: 'createdAt',
                sortDirection: 'desc'
            }


            if (experience !== undefined && experience !== null && experience !== '') {
                filters.experience = Number(experience);
            }
            if (jobType) {
                filters.jobType = Array.isArray(jobType) ? jobType : [jobType];
            }

            if (workMode) {
                filters.workMode = Array.isArray(workMode) ? workMode : [workMode];
            }

            if (industry) {
                filters.industry = Array.isArray(industry) ? industry.map(id => new mongoose.Types.ObjectId(id)) : [new mongoose.Types.ObjectId(industry)];
            }
            if (jobCategory) {
                filters.jobCategory = Array.isArray(jobCategory) ? jobCategory.map(id => new mongoose.Types.ObjectId(id)) : [new mongoose.Types.ObjectId(jobCategory)];
            }

            if (location) {
                filters.location = Array.isArray(location) ? location.map(id => new mongoose.Types.ObjectId(id)) : [new mongoose.Types.ObjectId(location)];
            }

            if (search) {
                filters.search = search;
            }

            if (postedTime) {
                filters.postedTime = parseInt(postedTime);
            }



            const { jobs, totalJobs, currentPage, totalPages } = await jobRepositories.getJobs(filters, options, userId);

            return res.status(200).json({
                status: true,
                message: 'Jobs fetched successfully.',
                data: jobs,
                totalRecords: totalJobs,
                currentPage: currentPage,
                totalPages: totalPages
            });



        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }


    async getCandidateJobDetail(req, res) {
        try {
            const jobId = req.params.id;
            const userId = req.user._id;

            const job = await jobRepositories.getDetailJobById(jobId, userId);
            if (!job) {
                return res.status(404).json({
                    status: flase,
                    message: "Job is not found."
                })
            }

            const postedTimeAgo = timeAgo(job.createdAt);

            return res.status(200).json({
                status: true,
                message: 'Job has been fetched successfully',
                data: { job, postedTimeAgo }
            })


        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async candidateBookMarkJob(req, res) {
        try {
            const userId = req.user._id;
            const jobId = req.params.id;

            const existsJob = await jobRepositories.getJobById(jobId);
            if (!existsJob) {
                return res.status(404).json({
                    status: false,
                    message: 'Job is not found'
                })
            }

            const bookMarked = await jobRepositories.bookMarkJob(userId, jobId);

            if (bookMarked) {
                return res.status(200).json({
                    status: true,
                    message: 'Job bookmarked successfully.'
                })
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Bookmark failed. User or job invalid.'
                });
            }

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async candidateUnbookMarkJob(req, res) {
        try {
            const userId = req.user._id;
            const jobId = req.params.id;

            const existsJob = await jobRepositories.getJobById(jobId);
            if (!existsJob) {
                return res.status(404).json({
                    status: false,
                    message: 'Job is not found'
                })
            }

            const unbookMarked = await jobRepositories.unbookMarkJob(userId, jobId);

            if (unbookMarked) {
                return res.status(200).json({
                    status: true,
                    message: 'Job unbookmarked successfully.'
                })
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'unbookmark failed. User or job invalid.'
                });
            }

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    // async getRecommendedJobsPage(req, res) {
    //     try {
    //         return res.render('candidate/recommended-jobs', { title: 'Recommended Jobs' })
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    async getCandidateRecommendedJobs(req, res) {
        try {
            const userId = req.user._id;
            const { page = 1, limit = 10 } = req.query;

            const options = {
                skip: (parseInt(page) - 1) * parseInt(limit),
                limit: parseInt(limit)
            };

            const { jobs, totalJobs, totalPages } = await jobRepositories.getRecommendateJobsPaginated(userId, options);
            // console.log(jobs);

            return res.status(200).json({
                status: true,
                message: 'Recommended jobs has been fetched sucessfully',
                data: jobs,
                totalRecords: totalJobs,
                currentPage: parseInt(page),
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

    async getDetailJobInformation(req, res) {
        try {
            const jobId = req.params.id;

            const job = await jobRepositories.getJobDetailInformationById(jobId);
            if (!job) {
                return res.status(404).json({
                    status: false,
                    message: 'Job is not found'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Job detail information is fetched successfully',
                data: job
            })


        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async softDeleteJob(req, res) {
        try {
            const jobId = req.params.id;

            const applications = await applicationRepositories.getAllAplicationsByJob(jobId);

            if (applications.length > 0) {
                return res.status(400).json({
                    status: false,
                    message: 'This job has application. You can not delete.'
                })
            }

            const deleteJob = await jobRepositories.softDeleteJob(jobId);


            if (!deleteJob) {
                return res.status(404).json({
                    status: false,
                    message: 'Job is not found'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Job is deleted successfully'
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    // async getCandidateSavedJobsPage(req, res) {
    //     try {
    //         return res.render('candidate/saved-jobs', { title: 'Saved Jobs' })
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    async getCandidateSavedJobs(req, res) {
        try {
            const userId = req.user._id;
            const { page = 1, limit = 10 } = req.query;

            const options = {
                skip: (parseInt(page) - 1) * parseInt(limit),
                limit: parseInt(limit)
            };

            const { jobs, totalJobs, totalPages } = await jobRepositories.getSavedJobs(userId, options);

            return res.status(200).json({
                status: true,
                message: 'Saved jobs has been fetched sucessfully',
                data: jobs,
                totalRecords: totalJobs,
                currentPage: parseInt(page),
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


}

module.exports = new JobController();
