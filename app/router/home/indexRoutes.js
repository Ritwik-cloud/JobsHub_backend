const express = require('express');
const routeLabel = require('route-label');
const HomeController=require('../../modules/home/controller/Homecontroller');
const SkillController = require('../../modules/predefined_data/controller/SkillController');
const IndustryController = require('../../modules/predefined_data/controller/IndustryController');
const JobCategoryController = require('../../modules/predefined_data/controller/JobCategoryController');
const LocationController = require('../../modules/predefined_data/controller/LocationController');
const JobController = require('../../modules/job/controller/JobController');
const CourseController = require('../../modules/predefined_data/controller/CourseController');
const SpecializationController = require('../../modules/predefined_data/controller/SpecializationController');
const BlogController = require('../../modules/blog/controller/BlogController');



const router = express.Router();

const namedRouter = routeLabel(router);

namedRouter.get('home-page','/',HomeController.getHomePage);
namedRouter.get('skill-search','/skills/search',SkillController.searchSkill);
namedRouter.get('all-industries','/industries/all',IndustryController.getAllIndustries);
namedRouter.get('all-job-categories','/job-categories/all',JobCategoryController.getAllJobCategories);

namedRouter.get('search-location','/locations/search',LocationController.searchLocation);

namedRouter.get('get-courses-by-educationLevel','/courses/by-educationLevel',CourseController.getCoursesByEducattionLevel);
namedRouter.get('get-specializations-by-course','/specializations/by-course/:courseId',SpecializationController.getSpecializationsByCourse);


namedRouter.get('search-suggestion','/search-suggestions-for-skill-title',JobController.searchSkillAndTitleSuggestion);
namedRouter.get('public-jobs-list','/jobs',JobController.getPublicJobs);
namedRouter.get('public-jobs-page','/jobs/page',JobController.getPublicJobPage);
namedRouter.get('public-job-detail-page','/jobs/:slug/:id/page',JobController.getPublicJobDetailPage);

namedRouter.get('public-blog-list-page','/blogs/page',BlogController.getPublicBlogPage);
namedRouter.get('public-blog-list','/blogs',BlogController.getBlogs);
namedRouter.get('public-detail-blog','/blogs/:id/:slug',BlogController.getPublicBlogDetailPage);


module.exports = router;