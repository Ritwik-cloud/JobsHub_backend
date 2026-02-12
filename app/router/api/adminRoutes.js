const express = require('express');
const routeLabel = require('route-label');
const { apiAuthenticateUser,apiAuthorizeRoles } = require('../../middleware/auth');
const createImageUploader = require('../../helper/imageUpload');
const blogImageUpload=createImageUploader('blog');
const portalLogoUpload=createImageUploader('portal');

const AdminController = require('../../webservice/AdminController');
const IndustryController = require('../../webservice/IndustryController');
const SkillController = require('../../webservice/SkillController');
const LocationController = require('../../webservice/LocationController');
const JobCategoryController = require('../../webservice/JobCategoryController');
const CompanyController = require('../../webservice/CompanyController');
const CourseController = require('../../webservice/CourseController');
const SpecializationController = require('../../webservice/SpecializationController');
const BlogCategoryController = require('../../webservice/BlogCategoryController');
const BlogController = require('../../webservice/BlogController');
const PortalSettingController = require('../../webservice/PortalSettingController');
const CandidateController = require('../../webservice/CandidateController');

const router = express.Router();

const namedRouter = routeLabel(router);

namedRouter.get('api-admin-dashboard','/admin/dashboard',apiAuthenticateUser,apiAuthorizeRoles('admin'),AdminController.dashboard);

// --- portal setting ----
namedRouter.get('api-portal-setting','/admin/portal-setting-page',apiAuthenticateUser,apiAuthorizeRoles('admin'),PortalSettingController.getPortalSettings);
namedRouter.post('api-save-setting','/admin/portal-setting/save',apiAuthenticateUser,apiAuthorizeRoles('admin'),portalLogoUpload.single('logo'),PortalSettingController.savePortalSetting);


//-- industry --
// namedRouter.get('manage-industry-page','/admin/industriespage',apiAuthenticateUser,apiAuthorizeRoles('admin'),IndustryController.manageIndustryPage);
namedRouter.post('api-add-industry','/admin/industries',apiAuthenticateUser,apiAuthorizeRoles('admin'),IndustryController.addIndustry);
namedRouter.get('api-industries-list','/admin/industries',apiAuthenticateUser,apiAuthorizeRoles('admin'),IndustryController.getAllIndustries);
namedRouter.get('api-edit-industry','/admin/industries/:id',apiAuthenticateUser,apiAuthorizeRoles('admin'),IndustryController.getIndustry);
namedRouter.put('api-update-industry','/admin/industries/:id/update',apiAuthenticateUser,apiAuthorizeRoles('admin'),IndustryController.updateIndustry);
namedRouter.delete('api-delete-industry','/admin/industries/:id/delete',apiAuthenticateUser,apiAuthorizeRoles('admin'),IndustryController.deleteIndustry);

// -- jobcategory --
// namedRouter.get('manage-jobCategory-page','/admin/job-categoriespage',apiAuthenticateUser,apiAuthorizeRoles('admin'),JobCategoryController.manageJobCategoryPage);
namedRouter.post('api-add-jobCategory','/admin/job-categories',apiAuthenticateUser,apiAuthorizeRoles('admin'),JobCategoryController.addJobCategory);
namedRouter.get('api-jobCategories-list','/admin/job-categories',apiAuthenticateUser,apiAuthorizeRoles('admin'),JobCategoryController.getAllJobCategories);
namedRouter.get('api-edit-jobCategory','/admin/job-categories/:id',apiAuthenticateUser,apiAuthorizeRoles('admin'),JobCategoryController.getJobCategory);
namedRouter.put('api-update-jobCategory','/admin/job-categories/:id/update',apiAuthenticateUser,apiAuthorizeRoles('admin'),JobCategoryController.updateJobCategory);
namedRouter.delete('api-delete-jobCategory','/admin/job-categories/:id/delete',apiAuthenticateUser,apiAuthorizeRoles('admin'),JobCategoryController.deleteJobCategory);

// ------- course & specialization ------

// namedRouter.get('manage-course-specialization-page','/admin/manage-course-specializationpage',apiAuthenticateUser,apiAuthorizeRoles('admin'),CourseController.manageCourseSpecializationPage);
namedRouter.post('api-add-course','/admin/courses',apiAuthenticateUser,apiAuthorizeRoles('admin'),CourseController.addCourse);
namedRouter.get('api-courses-list','/admin/courses',apiAuthenticateUser,apiAuthorizeRoles('admin'),CourseController.getAllCourses);
namedRouter.get('api-edit-course','/admin/courses/:id',apiAuthenticateUser,apiAuthorizeRoles('admin'),CourseController.getCourse);
namedRouter.put('api-update-course','/admin/courses/:id/update',apiAuthenticateUser,apiAuthorizeRoles('admin'),CourseController.updateCourse);
namedRouter.delete('api-delete-course','/admin/courses/:id/delete',apiAuthenticateUser,apiAuthorizeRoles('admin'),CourseController.deleteCourse);

namedRouter.post('api-add-specialization','/admin/specializations',apiAuthenticateUser,apiAuthorizeRoles('admin'),SpecializationController.addSpecialization);
namedRouter.get('api-specialization-list','/admin/specializations',apiAuthenticateUser,apiAuthorizeRoles('admin'),SpecializationController.getAllSpecializations);
namedRouter.get('api-edit-specialization','/admin/specializations/:id',apiAuthenticateUser,apiAuthorizeRoles('admin'),SpecializationController.getSpecialization);
namedRouter.put('api-update-specialization','/admin/specializations/:id/update',apiAuthenticateUser,apiAuthorizeRoles('admin'),SpecializationController.updateSpecialization);
namedRouter.delete('api-delete-specialization','/admin/specializations/:id/delete',apiAuthenticateUser,apiAuthorizeRoles('admin'),SpecializationController.deleteSpecialization);

//-- skill --
// namedRouter.get('manage-skill-page','/admin/skillspage',apiAuthenticateUser,apiAuthorizeRoles('admin'),SkillController.manageSkillPage);
namedRouter.post('api-add-skill','/admin/skills',apiAuthenticateUser,apiAuthorizeRoles('admin'),SkillController.addSkill);
namedRouter.get('api-skills-list','/admin/skills',apiAuthenticateUser,apiAuthorizeRoles('admin'),SkillController.getAllSkills);
namedRouter.get('api-edit-skill','/admin/skills/:id',apiAuthenticateUser,apiAuthorizeRoles('admin'),SkillController.getSkill);
namedRouter.put('api-update-skill','/admin/skills/:id/update',apiAuthenticateUser,apiAuthorizeRoles('admin'),SkillController.updateSkill);
namedRouter.delete('api-delete-skill','/admin/skills/:id/delete',apiAuthenticateUser,apiAuthorizeRoles('admin'),SkillController.deleteSkill);

//-- location --
// namedRouter.get('manage-location-page','/admin/locationspage',apiAuthenticateUser,apiAuthorizeRoles('admin'),LocationController.manageLocationPage);
namedRouter.post('api-add-location','/admin/locations',apiAuthenticateUser,apiAuthorizeRoles('admin'),LocationController.addLocation);
namedRouter.get('api-locations-list','/admin/locations',apiAuthenticateUser,apiAuthorizeRoles('admin'),LocationController.getAllLocations);
namedRouter.get('api-edit-location','/admin/locations/:id',apiAuthenticateUser,apiAuthorizeRoles('admin'),LocationController.getLocation);
namedRouter.put('api-update-location','/admin/locations/:id/update',apiAuthenticateUser,apiAuthorizeRoles('admin'),LocationController.updateLocation);
namedRouter.delete('api-delete-location','/admin/locations/:id/delete',apiAuthenticateUser,apiAuthorizeRoles('admin'),LocationController.deleteLocation);

// -------- manage listed company ---------

// namedRouter.get('manage-company-page','/admin/Companiespage',apiAuthenticateUser,apiAuthorizeRoles('admin'),CompanyController.getManageCompaniesPageByAdmin);
namedRouter.get('api-company-list','/admin/companies/pagination',apiAuthenticateUser,apiAuthorizeRoles('admin'),CompanyController.getCompaniesPaginated);
namedRouter.put('api-activate-company','/admin/companies/:id/activate',apiAuthenticateUser,apiAuthorizeRoles('admin'),CompanyController.activateCompany);
namedRouter.put('api-deactivate-company','/admin/companies/:id/deactivate',apiAuthenticateUser,apiAuthorizeRoles('admin'),CompanyController.deactivateCompany);

// ----- manage candidates ----------
// namedRouter.get('manage-candidate-page','/admin/candidatespage',apiAuthenticateUser,apiAuthorizeRoles('admin'),CandidateController.getManageCandidatePage);
namedRouter.get('api-candidate-list','/admin/candidates/pagination',apiAuthenticateUser,apiAuthorizeRoles('admin'),CandidateController.getCandidatesPaginated);
namedRouter.put('api-deactive-candidate','/admin/candidates/:id/deactivate',apiAuthenticateUser,apiAuthorizeRoles('admin'),CandidateController.deactivateCandidate);
namedRouter.put('api-active-candidate','/admin/candidates/:id/activate',apiAuthenticateUser,apiAuthorizeRoles('admin'),CandidateController.activateCandidate);
namedRouter.put('api-remove-candidate','/admin/candidates/:id/remove',apiAuthenticateUser,apiAuthorizeRoles('admin'),CandidateController.removeCandidate);

// ---- blog category -------------

// namedRouter.get('manage-blogCategory-page','/admin/blogCategorypage',apiAuthenticateUser,apiAuthorizeRoles('admin'),BlogCategoryController.manageBlogCategoryPage);
namedRouter.post('api-add-blogCategory','/admin/blogCategories',apiAuthenticateUser,apiAuthorizeRoles('admin'),BlogCategoryController.addBlogCategory);
namedRouter.get('api-blogCategoreies-list','/admin/blogCategories',apiAuthenticateUser,apiAuthorizeRoles('admin'),BlogCategoryController.getAllBlogCategories);
namedRouter.get('api-edit-blogCategory','/admin/blogCategories/:id',apiAuthenticateUser,apiAuthorizeRoles('admin'),BlogCategoryController.getBlogCategory);
namedRouter.put('api-update-blogCategory','/admin/blogCategories/:id/update',apiAuthenticateUser,apiAuthorizeRoles('admin'),BlogCategoryController.updateBlogCategory);
namedRouter.delete('api-delete-blogCategory','/admin/blogCategories/:id/delete',apiAuthenticateUser,apiAuthorizeRoles('admin'),BlogCategoryController.deleteBlogCategory);

// ----- blog ---------

// namedRouter.get('manage-blog-page','/admin/blogpage',apiAuthenticateUser,apiAuthorizeRoles('admin'),BlogController.manageBlogPage);
// namedRouter.get('add-blog-page','/admin/blogs/add',apiAuthenticateUser,apiAuthorizeRoles('admin'),BlogController.addBlogPage);
namedRouter.post('api-add-blog','/admin/blogs/add',apiAuthenticateUser,apiAuthorizeRoles('admin'),blogImageUpload.single('coverImage'),BlogController.addBlog); 
namedRouter.get('api-blog-list','/admin/blogs/pagination',apiAuthenticateUser,apiAuthorizeRoles('admin'),BlogController.getAllBlogsPaginated); 
// namedRouter.get('edit-blog','/admin/blogs/:id',apiAuthenticateUser,apiAuthorizeRoles('admin'),BlogController.getEditBlogPage); 
namedRouter.put('api-update-blog','/admin/blogs/:id/update',apiAuthenticateUser,apiAuthorizeRoles('admin'),blogImageUpload.single('coverImage'),BlogController.updateBlog); 
namedRouter.put('api-update-blog-status','/admin/blogs/:id/status-update',apiAuthenticateUser,apiAuthorizeRoles('admin'),BlogController.updateBlogStatus); 
namedRouter.delete('api-delete-blog','/admin/blogs/:id/delete',apiAuthenticateUser,apiAuthorizeRoles('admin'),BlogController.deleteBlog); 

module.exports = router;