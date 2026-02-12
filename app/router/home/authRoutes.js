const express = require('express');
const routeLabel = require('route-label');
const AuthController=require('../../modules/home/controller/AuthController');
// const {authCheck,authorizeRoles}=require('../../middleware/auth');


const router = express.Router();

const namedRouter = routeLabel(router);


namedRouter.get('recruiter-register-page','/auth/register-recruiter',AuthController.getRecruiterRegisterPage);
namedRouter.post('recruiter-register','/auth/register-recruiter',AuthController.registerRecruiter);
namedRouter.get('candidate-register-page','/auth/register-candidate',AuthController.getCandidateRegisterPage);
namedRouter.post('candidate-register','/auth/register-candidate',AuthController.registerCandidate);


namedRouter.get('login-page','/auth/login',AuthController.getLoginPage);
// namedRouter.post('login','/auth/login',AuthController.login);
namedRouter.post('candidate-login','/auth/login/candidate',AuthController.loginCandidate);
namedRouter.post('recruiter-login','/auth/login/recruiter',AuthController.loginRecruiter);


namedRouter.get('verify-email','/auth/verify-email/:token',AuthController.verifyEmail);
namedRouter.get('auth-message','/auth/message',AuthController.authMessagePage);

namedRouter.get('forgot-password-page','/auth/forgot-password',AuthController.getForgotPasswordPage);
namedRouter.post('forgot-password','/auth/forgot-password',AuthController.forgotPassword);
namedRouter.post('verify-otp-reset-password','/auth/verify-otp-and-reset-password',AuthController.verifyOtpAndPassword);

namedRouter.get('candidate-logout','/auth/logout/candidate',AuthController.candidateLogout);
namedRouter.get('admin-logout','/auth/logout/admin',AuthController.adminLogout);
namedRouter.get('recruiter-logout','/auth/logout/recruiter',AuthController.recruiterLogout);



module.exports = router;