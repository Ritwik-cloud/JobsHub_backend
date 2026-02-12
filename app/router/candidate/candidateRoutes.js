const express = require('express');
const routeLabel = require('route-label');
const { authenticate,authorizeRoles } = require('../../middleware/auth');
const createImageUploader = require('../../helper/imageUpload');
const userImageUpload=createImageUploader('user');

const CandidateController = require('../../modules/candidate/controller/CandidateController');
const SkillController = require('../../modules/predefined_data/controller/SkillController');
const pdfUpload = require('../../helper/pdfUpload');
const JobController = require('../../modules/job/controller/JobController');
const ApplicationController = require('../../modules/application/controller/ApplicationController');
const BlogController = require('../../modules/blog/controller/BlogController');
const AuthController = require('../../modules/home/controller/AuthController');


const router = express.Router();

const namedRouter = routeLabel(router);

namedRouter.get('candidate-dashboard','/candidate/dashboard',authenticate,authorizeRoles('candidate'),CandidateController.dashboard);
namedRouter.get('candidate-update-password-page','/candidate/update/password',authenticate,authorizeRoles('candidate'),CandidateController.getUpdatePasswordPage);
namedRouter.post('candidate-update-password','/candidate/update/password',authenticate,authorizeRoles('candidate'),AuthController.updatePassword);

namedRouter.get('candidate-profile','/candidate/profile',authenticate,authorizeRoles('candidate'),CandidateController.profilePage);
namedRouter.get('profile-details','/candidate/profile/basic-details',authenticate,authorizeRoles('candidate'),CandidateController.getCandidateBasicDetails);
namedRouter.put('profile-details-update','/candidate/profile/basic-details/update',authenticate,authorizeRoles('candidate'),CandidateController.updateCandidateBsicDetail);
namedRouter.put('profile-picture-update','/candidate/profile/profile-image/update',authenticate,authorizeRoles('candidate'),userImageUpload.single('profilePicture'),CandidateController.updateProfileImage);
namedRouter.get('candidate-profile-summary','/candidate/profile/profile-summary',authenticate,authorizeRoles('candidate'),CandidateController.getCandidateProfileSummary);
namedRouter.put('canddate-profile-summary-update','/candidate/profile/profile-summary/update',authenticate,authorizeRoles('candidate'),CandidateController.updateCandidateProfileSummary);


namedRouter.get('candidate-skills','/candidate/profile/skills',authenticate,authorizeRoles('candidate'),CandidateController.getCandidateSkills);
namedRouter.put('candidate-skills-update','/candidate/profile/skills/update',authenticate,authorizeRoles('candidate'),CandidateController.updateCandidateSkills);

namedRouter.post('candidate-education-add','/candidate/profile/education/add',authenticate,authorizeRoles('candidate'),CandidateController.addCandidateEducation);
namedRouter.delete('candidate-education-delete','/candidate/profile/education/:id/delete',authenticate,authorizeRoles('candidate'),CandidateController.deleteCandidateEducation);

namedRouter.post('candidate-workExperience-add','/candidate/profile/workExperience/add',authenticate,authorizeRoles('candidate'),CandidateController.addCandidateWorkExperience);
namedRouter.delete('candidate-workExperience-delete','/candidate/profile/workExperience/:id/delete',authenticate,authorizeRoles('candidate'),CandidateController.deleteCandidateWorkExperience);

namedRouter.get('candidate-career-preferences','/candidate/profile/career-preferences',authenticate,authorizeRoles('candidate'),CandidateController.getCandidatecarrerPeference);
namedRouter.put('candidate-career-preferences-update','/candidate/profile/career-preferences/update',authenticate,authorizeRoles('candidate'),CandidateController.updateCareerPreferences);

namedRouter.post('candidate-project-add','/candidate/profile/project/add',authenticate,authorizeRoles('candidate'),CandidateController.addCandidateProject);
namedRouter.delete('candidate-project-delete','/candidate/profile/project/:id/delete',authenticate,authorizeRoles('candidate'),CandidateController.deleteCandidateProject);

namedRouter.put('profile-resume-update','/candidate/profile/resume/update',authenticate,authorizeRoles('candidate'),pdfUpload.single('resume'),CandidateController.updateCandidateResume);

namedRouter.get('candidate-job-find-page','/candidate/jobs/findpage',authenticate,authorizeRoles('candidate'),JobController.getCandidateFindJobPage);
namedRouter.get('candidate-job-find','/candidate/jobs/find',authenticate,authorizeRoles('candidate'),JobController.getCandidateFindJobs);

namedRouter.get('candidate-job-recommended-page','/candidate/jobs/recommendedpage',authenticate,authorizeRoles('candidate'),JobController.getRecommendedJobsPage);
namedRouter.get('candidate-job-recommended','/candidate/jobs/recommended',authenticate,authorizeRoles('candidate'),JobController.getCandidateRecommendedJobs);

namedRouter.get('candidate-job-saved-page','/candidate/jobs/savedpage',authenticate,authorizeRoles('candidate'),JobController.getCandidateSavedJobsPage);
namedRouter.get('candidate-job-saved','/candidate/jobs/saved',authenticate,authorizeRoles('candidate'),JobController.getCandidateSavedJobs);

namedRouter.get('candidate-application-status-page','/candidate/applied-jobspage',authenticate,authorizeRoles('candidate'),ApplicationController.getCandidateAppliedJobsPage);
namedRouter.get('candidate-applications-status','/candidate/applied-jobs/pagination',authenticate,authorizeRoles('candidate'),ApplicationController.getCandidateAppliedJobs);

namedRouter.get('candidate-job-detail-find','/candidate/jobs/:slug/:id/page',authenticate,authorizeRoles('candidate'),JobController.getCandidateJobDetailPage);

namedRouter.put('candidate-bookmark-job','/candidate/jobs/:id/bookmark',authenticate,authorizeRoles('candidate'),JobController.candidateBookMarkJob);
namedRouter.put('candidate-unbookmark-job','/candidate/jobs/:id/unbookmark',authenticate,authorizeRoles('candidate'),JobController.candidateUnbookMarkJob);


namedRouter.post('candidate-apply-job','/candidate/jobs/:id/apply',authenticate,authorizeRoles('candidate'),ApplicationController.applyForJob);

namedRouter.get('candidate-blog-list-page','/candidate/blogs/page',authenticate,authorizeRoles('candidate'),BlogController.getCandidateBlogPage);

namedRouter.get('candidate-detail-blog','/candidate/blogs/:id/:slug',authenticate,authorizeRoles('candidate'),BlogController.getCandidateBlogDetailPage);






module.exports = router;