const express = require('express');
const routeLabel = require('route-label');
const CompanyController = require('../../modules/company/controller/CompanyController');
// const {authCheck,authorizeRoles}=require('../../middleware/auth');


const router = express.Router();

const namedRouter = routeLabel(router);

namedRouter.get('company-search-by-name','/companies/search-name',CompanyController.searchComanyByName);

module.exports = router;