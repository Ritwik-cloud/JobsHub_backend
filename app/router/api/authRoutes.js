const express = require('express');
const routeLabel = require('route-label');
const AuthController=require('../../webservice/AuthController');

const router = express.Router();

const namedRouter = routeLabel(router);


namedRouter.post('api-recruiter-register','/auth/register-recruiter',AuthController.registerRecruiter);

namedRouter.post('api-candidate-register','/auth/register-candidate',AuthController.registerCandidate);


namedRouter.post('api-candidate-login','/auth/login/candidate',AuthController.loginCandidate);
namedRouter.post('api-recruiter-login','/auth/login/recruiter',AuthController.loginRecruiter);


namedRouter.get('api-verify-email','/auth/verify-email/:token',AuthController.verifyEmail);





module.exports = router;