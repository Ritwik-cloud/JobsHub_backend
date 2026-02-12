const express = require('express');
const routeLabel = require('route-label');

const SkillController = require('../../webservice/SkillController');
const IndustryController = require('../../webservice/IndustryController');
const JobCategoryController = require('../../webservice/JobCategoryController');
const LocationController = require('../../webservice/LocationController');
const JobController = require('../../webservice/JobController');
const CourseController = require('../../webservice/CourseController');
const SpecializationController = require('../../webservice/SpecializationController');
const BlogController = require('../../webservice/BlogController');

const router = express.Router();

const namedRouter = routeLabel(router);

namedRouter.get('api-skill-search','/skills/search',SkillController.searchSkill);
namedRouter.get('api-all-industries','/industries/all',IndustryController.getAllIndustries);
namedRouter.get('api-all-job-categories','/job-categories/all',JobCategoryController.getAllJobCategories);
namedRouter.get('api-search-location','/locations/search',LocationController.searchLocation);

namedRouter.get('api-get-courses-by-educationLevel','/courses/by-educationLevel',CourseController.getCoursesByEducattionLevel);
namedRouter.get('api-get-specializations-by-course','/specializations/by-course/:courseId',SpecializationController.getSpecializationsByCourse);


namedRouter.get('api-search-suggestion','/search-suggestions-for-skill-title',JobController.searchSkillAndTitleSuggestion);
namedRouter.get('api-public-jobs-list','/jobs',JobController.getPublicJobs);
// namedRouter.get('api-public-jobs-page','/jobs/page',JobController.getPublicJobPage);
namedRouter.get('api-public-job-detail','/jobs/:slug/:id/page',JobController.getPublicJobDetail);

// namedRouter.get('api-public-blog-list-page','/blogs/page',BlogController.getPublicBlogPage);
namedRouter.get('api-public-blog-list','/blogs',BlogController.getBlogs);
namedRouter.get('api-public-detail-blog','/blogs/:id/:slug',BlogController.getPublicBlogDetail);


module.exports = router;