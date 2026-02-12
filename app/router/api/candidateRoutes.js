const express = require('express');
const routeLabel = require('route-label');
const { apiAuthenticateUser,apiAuthorizeRoles } = require('../../middleware/auth');
const createImageUploader = require('../../helper/imageUpload');
const userImageUpload=createImageUploader('user');

const CandidateController = require('../../webservice/CandidateController');
const SkillController = require('../../webservice/SkillController');
const pdfUpload = require('../../helper/pdfUpload');
const JobController = require('../../webservice/JobController');
const ApplicationController = require('../../webservice/ApplicationController');
const BlogController = require('../../webservice/BlogController');


const router = express.Router();

const namedRouter = routeLabel(router);

namedRouter.get('api-candidate-dashboard','/candidate/dashboard',apiAuthenticateUser,apiAuthorizeRoles('candidate'),CandidateController.dashboard);

namedRouter.get('api-candidate-profile','/candidate/profile',apiAuthenticateUser,apiAuthorizeRoles('candidate'),CandidateController.getCandidateprofileData);
namedRouter.get('api-profile-details','/candidate/profile/basic-details',apiAuthenticateUser,apiAuthorizeRoles('candidate'),CandidateController.getCandidateBasicDetails);
namedRouter.put('api-profile-details-update','/candidate/profile/basic-details/update',apiAuthenticateUser,apiAuthorizeRoles('candidate'),CandidateController.updateCandidateBsicDetail);
namedRouter.put('api-profile-picture-update','/candidate/profile/profile-image/update',apiAuthenticateUser,apiAuthorizeRoles('candidate'),userImageUpload.single('profilePicture'),CandidateController.updateProfileImage);
namedRouter.get('api-candidate-profile-summary','/candidate/profile/profile-summary',apiAuthenticateUser,apiAuthorizeRoles('candidate'),CandidateController.getCandidateProfileSummary);
namedRouter.put('api-canddate-profile-summary-update','/candidate/profile/profile-summary/update',apiAuthenticateUser,apiAuthorizeRoles('candidate'),CandidateController.updateCandidateProfileSummary);


namedRouter.get('api-candidate-skills','/candidate/profile/skills',apiAuthenticateUser,apiAuthorizeRoles('candidate'),CandidateController.getCandidateSkills);
namedRouter.put('api-candidate-skills-update','/candidate/profile/skills/update',apiAuthenticateUser,apiAuthorizeRoles('candidate'),CandidateController.updateCandidateSkills);

namedRouter.post('api-candidate-education-add','/candidate/profile/education/add',apiAuthenticateUser,apiAuthorizeRoles('candidate'),CandidateController.addCandidateEducation);
namedRouter.delete('api-candidate-education-delete','/candidate/profile/education/:id/delete',apiAuthenticateUser,apiAuthorizeRoles('candidate'),CandidateController.deleteCandidateEducation);

namedRouter.post('api-candidate-workExperience-add','/candidate/profile/workExperience/add',apiAuthenticateUser,apiAuthorizeRoles('candidate'),CandidateController.addCandidateWorkExperience);
namedRouter.delete('api-candidate-workExperience-delete','/candidate/profile/workExperience/:id/delete',apiAuthenticateUser,apiAuthorizeRoles('candidate'),CandidateController.deleteCandidateWorkExperience);

namedRouter.get('api-candidate-career-preferences','/candidate/profile/career-preferences',apiAuthenticateUser,apiAuthorizeRoles('candidate'),CandidateController.getCandidatecarrerPeference);
namedRouter.put('api-candidate-career-preferences-update','/candidate/profile/career-preferences/update',apiAuthenticateUser,apiAuthorizeRoles('candidate'),CandidateController.updateCareerPreferences);

namedRouter.post('api-candidate-project-add','/candidate/profile/project/add',apiAuthenticateUser,apiAuthorizeRoles('candidate'),CandidateController.addCandidateProject);
namedRouter.delete('api-candidate-project-delete','/candidate/profile/project/:id/delete',apiAuthenticateUser,apiAuthorizeRoles('candidate'),CandidateController.deleteCandidateProject);

namedRouter.put('api-profile-resume-update','/candidate/profile/resume/update',apiAuthenticateUser,apiAuthorizeRoles('candidate'),pdfUpload.single('resume'),CandidateController.updateCandidateResume);

// namedRouter.get('api-candidate-job-find-page','/candidate/jobs/findpage',apiAuthenticateUser,apiAuthorizeRoles('candidate'),JobController.getCandidateFindJobPage);
namedRouter.get('api-candidate-job-find','/candidate/jobs/find',apiAuthenticateUser,apiAuthorizeRoles('candidate'),JobController.getCandidateFindJobs);

// namedRouter.get('api-candidate-job-recommended-page','/candidate/jobs/recommendedpage',apiAuthenticateUser,apiAuthorizeRoles('candidate'),JobController.getRecommendedJobsPage);
namedRouter.get('api-candidate-job-recommended','/candidate/jobs/recommended',apiAuthenticateUser,apiAuthorizeRoles('candidate'),JobController.getCandidateRecommendedJobs);

// namedRouter.get('api-candidate-job-saved-page','/candidate/jobs/savedpage',apiAuthenticateUser,apiAuthorizeRoles('candidate'),JobController.getCandidateSavedJobsPage);
namedRouter.get('api-candidate-job-saved','/candidate/jobs/saved',apiAuthenticateUser,apiAuthorizeRoles('candidate'),JobController.getCandidateSavedJobs);

// namedRouter.get('api-candidate-application-status-page','/candidate/applied-jobspage',apiAuthenticateUser,apiAuthorizeRoles('candidate'),ApplicationController.getCandidateAppliedJobsPage);
namedRouter.get('api-candidate-applications-status','/candidate/applied-jobs/pagination',apiAuthenticateUser,apiAuthorizeRoles('candidate'),ApplicationController.getCandidateAppliedJobs);

namedRouter.get('api-candidate-job-detail-find','/candidate/jobs/:slug/:id/page',apiAuthenticateUser,apiAuthorizeRoles('candidate'),JobController.getCandidateJobDetail);

namedRouter.put('api-candidate-bookmark-job','/candidate/jobs/:id/bookmark',apiAuthenticateUser,apiAuthorizeRoles('candidate'),JobController.candidateBookMarkJob);
namedRouter.put('api-candidate-unbookmark-job','/candidate/jobs/:id/unbookmark',apiAuthenticateUser,apiAuthorizeRoles('candidate'),JobController.candidateUnbookMarkJob);


namedRouter.post('api-candidate-apply-job','/candidate/jobs/:id/apply',apiAuthenticateUser,apiAuthorizeRoles('candidate'),ApplicationController.applyForJob);

// namedRouter.get('api-candidate-blog-list-page','/candidate/blogs/page',apiAuthenticateUser,apiAuthorizeRoles('candidate'),BlogController.getCandidateBlogPage);

namedRouter.get('api-candidate-detail-blog','/candidate/blogs/:id/:slug',apiAuthenticateUser,apiAuthorizeRoles('candidate'),BlogController.getCandidateBlogDetail);


module.exports = router;