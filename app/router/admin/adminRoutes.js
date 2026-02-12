const express = require('express');
const routeLabel = require('route-label');
const { authenticate,authorizeRoles } = require('../../middleware/auth');
const createImageUploader = require('../../helper/imageUpload');
const blogImageUpload=createImageUploader('blog');
const portalLogoUpload=createImageUploader('portal');

const AdminController = require('../../modules/admin/controller/AdminController');
const IndustryController = require('../../modules/predefined_data/controller/IndustryController');
const SkillController = require('../../modules/predefined_data/controller/SkillController');
const LocationController = require('../../modules/predefined_data/controller/LocationController');
const JobCategoryController = require('../../modules/predefined_data/controller/JobCategoryController');
const CompanyController = require('../../modules/company/controller/CompanyController');
const CourseController = require('../../modules/predefined_data/controller/CourseController');
const SpecializationController = require('../../modules/predefined_data/controller/SpecializationController');
const BlogCategoryController = require('../../modules/blog/controller/BlogCategoryController');
const BlogController = require('../../modules/blog/controller/BlogController');
const PortalSettingController = require('../../modules/portal_setting/contoller/PortalSettingController');
const CandidateController = require('../../modules/candidate/controller/CandidateController');
const AuthController = require('../../modules/home/controller/AuthController');

const router = express.Router();

const namedRouter = routeLabel(router);

namedRouter.get('admin-dashboard','/admin/dashboard',authenticate,authorizeRoles('admin'),AdminController.dashboard);

// --- portal setting ----
namedRouter.get('portal-setting-page','/admin/portal-setting-page',authenticate,authorizeRoles('admin'),PortalSettingController.portalSettingPage);
namedRouter.post('save-setting-page','/admin/portal-setting/save',authenticate,authorizeRoles('admin'),portalLogoUpload.single('logo'),PortalSettingController.savePortalSetting);

namedRouter.get('admin-update-password-page','/admin/update/password',authenticate,authorizeRoles('admin'),AdminController.getUpdatePasswordPage);
namedRouter.post('admin-update-password','/admin/update/password',authenticate,authorizeRoles('admin'),AuthController.updatePassword);


//-- industry --
namedRouter.get('manage-industry-page','/admin/industriespage',authenticate,authorizeRoles('admin'),IndustryController.manageIndustryPage);
namedRouter.post('add-industry','/admin/industries',authenticate,authorizeRoles('admin'),IndustryController.addIndustry);
namedRouter.get('industries-list','/admin/industries',authenticate,authorizeRoles('admin'),IndustryController.getAllIndustries);
namedRouter.get('edit-industry','/admin/industries/:id',authenticate,authorizeRoles('admin'),IndustryController.getIndustry);
namedRouter.put('update-industry','/admin/industries/:id/update',authenticate,authorizeRoles('admin'),IndustryController.updateIndustry);
namedRouter.delete('delete-industry','/admin/industries/:id/delete',authenticate,authorizeRoles('admin'),IndustryController.deleteIndustry);

// -- jobcategory --
namedRouter.get('manage-jobCategory-page','/admin/job-categoriespage',authenticate,authorizeRoles('admin'),JobCategoryController.manageJobCategoryPage);
namedRouter.post('add-jobCategory','/admin/job-categories',authenticate,authorizeRoles('admin'),JobCategoryController.addJobCategory);
namedRouter.get('jobCategories-list','/admin/job-categories',authenticate,authorizeRoles('admin'),JobCategoryController.getAllJobCategories);
namedRouter.get('edit-jobCategory','/admin/job-categories/:id',authenticate,authorizeRoles('admin'),JobCategoryController.getJobCategory);
namedRouter.put('update-jobCategory','/admin/job-categories/:id/update',authenticate,authorizeRoles('admin'),JobCategoryController.updateJobCategory);
namedRouter.delete('delete-jobCategory','/admin/job-categories/:id/delete',authenticate,authorizeRoles('admin'),JobCategoryController.deleteJobCategory);

// ------- course & specialization ------

namedRouter.get('manage-course-specialization-page','/admin/manage-course-specializationpage',authenticate,authorizeRoles('admin'),CourseController.manageCourseSpecializationPage);
namedRouter.post('add-course','/admin/courses',authenticate,authorizeRoles('admin'),CourseController.addCourse);
namedRouter.get('courses-list','/admin/courses',authenticate,authorizeRoles('admin'),CourseController.getAllCourses);
namedRouter.get('edit-course','/admin/courses/:id',authenticate,authorizeRoles('admin'),CourseController.getCourse);
namedRouter.put('update-course','/admin/courses/:id/update',authenticate,authorizeRoles('admin'),CourseController.updateCourse);
namedRouter.delete('delete-course','/admin/courses/:id/delete',authenticate,authorizeRoles('admin'),CourseController.deleteCourse);

namedRouter.post('add-specialization','/admin/specializations',authenticate,authorizeRoles('admin'),SpecializationController.addSpecialization);
namedRouter.get('specialization-list','/admin/specializations',authenticate,authorizeRoles('admin'),SpecializationController.getAllSpecializations);
namedRouter.get('edit-specialization','/admin/specializations/:id',authenticate,authorizeRoles('admin'),SpecializationController.getSpecialization);
namedRouter.put('update-specialization','/admin/specializations/:id/update',authenticate,authorizeRoles('admin'),SpecializationController.updateSpecialization);
namedRouter.delete('delete-specialization','/admin/specializations/:id/delete',authenticate,authorizeRoles('admin'),SpecializationController.deleteSpecialization);

//-- skill --
namedRouter.get('manage-skill-page','/admin/skillspage',authenticate,authorizeRoles('admin'),SkillController.manageSkillPage);
namedRouter.post('add-skill','/admin/skills',authenticate,authorizeRoles('admin'),SkillController.addSkill);
namedRouter.get('skills-list','/admin/skills',authenticate,authorizeRoles('admin'),SkillController.getAllSkills);
namedRouter.get('edit-skill','/admin/skills/:id',authenticate,authorizeRoles('admin'),SkillController.getSkill);
namedRouter.put('update-skill','/admin/skills/:id/update',authenticate,authorizeRoles('admin'),SkillController.updateSkill);
namedRouter.delete('delete-skill','/admin/skills/:id/delete',authenticate,authorizeRoles('admin'),SkillController.deleteSkill);

//-- location --
namedRouter.get('manage-location-page','/admin/locationspage',authenticate,authorizeRoles('admin'),LocationController.manageLocationPage);
namedRouter.post('add-location','/admin/locations',authenticate,authorizeRoles('admin'),LocationController.addLocation);
namedRouter.get('locations-list','/admin/locations',authenticate,authorizeRoles('admin'),LocationController.getAllLocations);
namedRouter.get('edit-location','/admin/locations/:id',authenticate,authorizeRoles('admin'),LocationController.getLocation);
namedRouter.put('update-location','/admin/locations/:id/update',authenticate,authorizeRoles('admin'),LocationController.updateLocation);
namedRouter.delete('delete-location','/admin/locations/:id/delete',authenticate,authorizeRoles('admin'),LocationController.deleteLocation);

// -------- manage listed company ---------

namedRouter.get('manage-company-page','/admin/Companiespage',authenticate,authorizeRoles('admin'),CompanyController.getManageCompaniesPageByAdmin);
namedRouter.get('company-list','/admin/companies/pagination',authenticate,authorizeRoles('admin'),CompanyController.getCompaniesPaginated);
namedRouter.put('activate-company','/admin/companies/:id/activate',authenticate,authorizeRoles('admin'),CompanyController.activateCompany);
namedRouter.put('deactivate-company','/admin/companies/:id/deactivate',authenticate,authorizeRoles('admin'),CompanyController.deactivateCompany);

// ----- manage candidates ----------
namedRouter.get('manage-candidate-page','/admin/candidatespage',authenticate,authorizeRoles('admin'),CandidateController.getManageCandidatePage);
namedRouter.get('candidate-list','/admin/candidates/pagination',authenticate,authorizeRoles('admin'),CandidateController.getCandidatesPaginated);
namedRouter.put('deactive-candidate','/admin/candidates/:id/deactivate',authenticate,authorizeRoles('admin'),CandidateController.deactivateCandidate);
namedRouter.put('active-candidate','/admin/candidates/:id/activate',authenticate,authorizeRoles('admin'),CandidateController.activateCandidate);
namedRouter.put('remove-candidate','/admin/candidates/:id/remove',authenticate,authorizeRoles('admin'),CandidateController.removeCandidate);

// ---- blog category -------------

namedRouter.get('manage-blogCategory-page','/admin/blogCategorypage',authenticate,authorizeRoles('admin'),BlogCategoryController.manageBlogCategoryPage);
namedRouter.post('add-blogCategory','/admin/blogCategories',authenticate,authorizeRoles('admin'),BlogCategoryController.addBlogCategory);
namedRouter.get('blogCategoreies-list','/admin/blogCategories',authenticate,authorizeRoles('admin'),BlogCategoryController.getAllBlogCategories);
namedRouter.get('edit-blogCategory','/admin/blogCategories/:id',authenticate,authorizeRoles('admin'),BlogCategoryController.getBlogCategory);
namedRouter.put('update-blogCategory','/admin/blogCategories/:id/update',authenticate,authorizeRoles('admin'),BlogCategoryController.updateBlogCategory);
namedRouter.delete('delete-blogCategory','/admin/blogCategories/:id/delete',authenticate,authorizeRoles('admin'),BlogCategoryController.deleteBlogCategory);

// ----- blog ---------

namedRouter.get('manage-blog-page','/admin/blogpage',authenticate,authorizeRoles('admin'),BlogController.manageBlogPage);
namedRouter.get('add-blog-page','/admin/blogs/add',authenticate,authorizeRoles('admin'),BlogController.addBlogPage);
namedRouter.post('add-blog','/admin/blogs/add',authenticate,authorizeRoles('admin'),blogImageUpload.single('coverImage'),BlogController.addBlog); 
namedRouter.get('blog-list','/admin/blogs/pagination',authenticate,authorizeRoles('admin'),BlogController.getAllBlogsPaginated); 
namedRouter.get('edit-blog','/admin/blogs/:id',authenticate,authorizeRoles('admin'),BlogController.getEditBlogPage); 
namedRouter.put('update-blog','/admin/blogs/:id/update',authenticate,authorizeRoles('admin'),blogImageUpload.single('coverImage'),BlogController.updateBlog); 
namedRouter.put('update-blog-status','/admin/blogs/:id/status-update',authenticate,authorizeRoles('admin'),BlogController.updateBlogStatus); 
namedRouter.delete('delete-blog','/admin/blogs/:id/delete',authenticate,authorizeRoles('admin'),BlogController.deleteBlog); 

module.exports = router;