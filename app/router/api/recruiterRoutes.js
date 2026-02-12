const express = require("express");
const routeLabel = require("route-label");
const RecruiterController = require("../../webservice/RecruiterController");
const {
  apiAuthenticateUser,
  apiAuthorizeRoles,
  apiCheckRecruiterAccess,
  apiOnlyAdminRecruiter,
} = require("../../middleware/auth");
const createImageUploader = require("../../helper/imageUpload");
const logoUpload = createImageUploader("companyLogo");
const userImageUpload = createImageUploader("user");

const CompanyController = require("../../webservice/CompanyController");
const JobController = require("../../webservice/JobController");
const ApplicationController = require("../../webservice/ApplicationController");
const CandidateController = require("../../webservice/CandidateController");

const router = express.Router();

const namedRouter = routeLabel(router);

namedRouter.get(
  "api-recruiter-home",
  "/recruiter/dashboard",
  apiAuthenticateUser,
  apiAuthorizeRoles("recruiter"),
  apiCheckRecruiterAccess,
  RecruiterController.dashboard
);
namedRouter.get(
  "api-recruiter-profile",
  "/recruiter/profile",
  apiAuthenticateUser,
  apiAuthorizeRoles("recruiter"),
  apiCheckRecruiterAccess,
  RecruiterController.getRecruiterProfile
);
namedRouter.put(
  "api-update-recruiter-profile",
  "/recruiter/update-profile",
  apiAuthenticateUser,
  apiAuthorizeRoles("recruiter"),
  apiCheckRecruiterAccess,
  userImageUpload.single("profilePicture"),
  RecruiterController.updateRecruiterProfile
);

// -- company --
namedRouter.get(
  "api-recruiter-manage-company-page",
  "/recruiter/manage-company",
  apiAuthenticateUser,
  apiAuthorizeRoles("recruiter"),
  apiCheckRecruiterAccess,
//   apiOnlyAdminRecruiter,
  CompanyController.getCompanyDetail
);
namedRouter.put(
  "api-recruiter-company-update",
  "/recruiter/company/:id/update",
  apiAuthenticateUser,
  apiAuthorizeRoles("recruiter"),
//   apiOnlyAdminRecruiter,
  logoUpload.single("logo"),
  CompanyController.updateCompany
);

// -- recruiter --
namedRouter.get(
  "api-manage-recruiter-page",
  "/recruiter/manage-recruiter",
  apiAuthenticateUser,
  apiAuthorizeRoles("recruiter"),
  apiCheckRecruiterAccess,
//   apiOnlyAdminRecruiter,
  RecruiterController.getRecruitersExceptCreatorRecruitor
);
namedRouter.put(
  "api-approve-recruiter",
  "/recruiter/:id/approve",
  apiAuthenticateUser,
  apiAuthorizeRoles("recruiter"),
  apiCheckRecruiterAccess,
  // apiOnlyAdminRecruiter,
  RecruiterController.approveRecruiter
);
namedRouter.put(
  "api-deactivate-recruiter",
  "/recruiter/:id/deactivate",
  apiAuthenticateUser,
  apiAuthorizeRoles("recruiter"),
  apiCheckRecruiterAccess,
  // apiOnlyAdminRecruiter,
  RecruiterController.deactivateRecruiter
);
namedRouter.put(
  "api-activate-recruiter",
  "/recruiter/:id/activate",
  apiAuthenticateUser,
  apiAuthorizeRoles("recruiter"),
  apiCheckRecruiterAccess,
  // apiOnlyAdminRecruiter,
  RecruiterController.activateRecruiter
);
namedRouter.put(
  "api-reject-recruiter",
  "/recruiter/:id/reject",
  apiAuthenticateUser,
  apiAuthorizeRoles("recruiter"),
  apiCheckRecruiterAccess,
  // apiOnlyAdminRecruiter,
  RecruiterController.rejectRecruiter
);

// --- jobs ----
// namedRouter.get('api-recruiter-post-job-page','/recruiter/jobs/add',apiAuthenticateUser,apiAuthorizeRoles('recruiter'),apiCheckRecruiterAccess,JobController.getAddJoPage);
namedRouter.post(
  "api-recruiter-post-job",
  "/recruiter/jobs/add",
  apiAuthenticateUser,
  apiAuthorizeRoles("recruiter"),
  apiCheckRecruiterAccess,
  JobController.createJob
);
// namedRouter.get('api-recruiter-manage-job-page','/recruiter/jobs/list',apiAuthenticateUser,apiAuthorizeRoles('recruiter'),apiCheckRecruiterAccess,JobController.manageJobPage);
namedRouter.get(
  "api-recruiter-posted-jobs",
  "/recruiter/jobs/by-recruiter/pagination",
  apiAuthenticateUser,
  apiAuthorizeRoles("recruiter"),
  apiCheckRecruiterAccess,
  JobController.getJobsPaginated
);
// namedRouter.get('api-recruiter-edit-job','/recruiter/jobs/:id',apiAuthenticateUser,apiAuthorizeRoles('recruiter'),apiCheckRecruiterAccess,JobController.getEditJobPage);
namedRouter.put(
  "api-recruiter-update-job",
  "/recruiter/jobs/:id/update",
  apiAuthenticateUser,
  apiAuthorizeRoles("recruiter"),
  apiCheckRecruiterAccess,
  JobController.updateJob
);
namedRouter.put(
  "api-recruiter-delete-job",
  "/recruiter/jobs/:id/delete",
  apiAuthenticateUser,
  apiAuthorizeRoles("recruiter"),
  apiCheckRecruiterAccess,
  JobController.softDeleteJob
);
namedRouter.put(
  "api-recruiter-status-update-job",
  "/recruiter/jobs/:id/status-update",
  apiAuthenticateUser,
  apiAuthorizeRoles("recruiter"),
  apiCheckRecruiterAccess,
  JobController.updateJobStatus
);
namedRouter.get(
  "api-recruiter-detail-info-job",
  "/recruiter/jobs/:id/detail-information",
  apiAuthenticateUser,
  apiAuthorizeRoles("recruiter"),
  apiCheckRecruiterAccess,
  JobController.getDetailJobInformation
);

// -- applications --
// namedRouter.get('api-recruiter-job-application','/recruiter/jobs/:id/applicationspage',apiAuthenticateUser,apiAuthorizeRoles('recruiter'),apiCheckRecruiterAccess,ApplicationController.getApplicationsPageByJob);
namedRouter.get(
  "api-recruiter-get-application-detail",
  "/recruiter/applications/:id/details",
  apiAuthenticateUser,
  apiAuthorizeRoles("recruiter"),
  apiCheckRecruiterAccess,
  ApplicationController.getApplicationDetails
);
namedRouter.get(
  "api-recruiter-get-applications",
  "/recruiter/applications/:jobId",
  apiAuthenticateUser,
  apiAuthorizeRoles("recruiter"),
  apiCheckRecruiterAccess,
  ApplicationController.getApplicationsPaginationByJobId
);
namedRouter.put(
  "api-recruiter-accept-appliation",
  "/recruiter/applications/:id/accept",
  apiAuthenticateUser,
  apiAuthorizeRoles("recruiter"),
  apiCheckRecruiterAccess,
  ApplicationController.acceptApplication
);
namedRouter.put(
  "api-recruiter-reject-appliation",
  "/recruiter/applications/:id/reject",
  apiAuthenticateUser,
  apiAuthorizeRoles("recruiter"),
  apiCheckRecruiterAccess,
  ApplicationController.rejectApplication
);

// -- profile --
namedRouter.get(
  "api-recruiter-get-candidate-profile",
  "/recruiter/view-candidate/:id",
  apiAuthenticateUser,
  apiAuthorizeRoles("recruiter"),
  apiCheckRecruiterAccess,
  CandidateController.getRecruiterViewOfCandidateProfile
);

module.exports = router;
