const jwt = require('jsonwebtoken');
const companyModel = require('../modules/company/model/companyModel');

const authenticate = (req, res, next) => {
  // const token = req.cookies.token;

  let token;

  if (req.path.startsWith('/admin')) {
    token = req.cookies.admin_token;
  } else if (req.path.startsWith('/recruiter')) {
    token = req.cookies.recruiter_token;
  } else if (req.path.startsWith('/candidate')) {
    token = req.cookies.candidate_token;
  } else {
    token = req.cookies.admin_token || req.cookies.recruiter_token || req.cookies.candidate_token;
  }


  if (!token) {
    if (req.xhr) {
      return res.status(401).json({ status: false, message: 'Unauthorized access' });
    }
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    res.locals.userInfo = req.user;

    // console.log(`Logged in as ${decoded.role} with ID: ${decoded._id}`);

    return next();
  } catch (err) {
    if (req.xhr) {
      return res.status(401).json({ status: false, message: 'Unauthorized access' });
    }
    return res.redirect('/auth/login');
  }
}

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.redirect('/auth/login');

    }
    return next();
  };
};



const checkRecruiterAccess = async (req, res, next) => {
  try {
    const user = req.user;

    res.locals.isCompanyAdmin = false;
    res.locals.companyIsActive = false;

    if (user && user.role === 'recruiter' && user.companyId) {
      const company = await companyModel.findById(user.companyId).lean();

      if (company) {
        res.locals.companyIsActive = company.isActive;
        if (user.recruiterRole === 'admin_recruiter') {
          res.locals.isCompanyAdmin = true;
        }
      }
    }

    // console.log(res.locals.isCompanyAdmin, res.locals.companyIsActive);

    return next();

  } catch (error) {
    console.log('Error in checkRecruiterAccess middleware:', error);
    return res.redirect('/auth/login');
  }
}

const onlyAdminRecruiter = (req, res, next) => {
  const user = req.user;

  const isAdminRecruiter =
    user?.role === 'recruiter' &&
    user?.recruiterRole === 'admin_recruiter';

  if (isAdminRecruiter) {
    return next();
  }

  const errorMessage = 'Access denied. Admin recruiter permission required.';

  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(403).json({
      status: false,
      message: errorMessage
    });
  } else {
    req.flash('error', errorMessage);
    return res.redirect('/recruiter/dashboard');
  }
};

const companyMustBeActive = (req, res, next) => {
  if (!res.locals.companyIsActive) {
    const errorMessage = 'Your company is not active. Please contact support.';

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(403).json({ status: false, message: errorMessage });
    } else {
      req.flash('error', errorMessage);
      return res.redirect('/recruiter/dashboard');
    }
  }

  return next();
};

const apiAuthenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: false, message: 'Authentication token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // console.log(`API User Authenticated: ${decoded.role} - ${decoded._id}`);
    return next();
  } catch (err) {
    return res.status(401).json({ status: false, message: 'Invalid or expired token' });
  }
};

const apiAuthorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: false,
        message: 'Forbidden: You do not have access to this resource'
      });
    }
    next();
  };
};

const apiOnlyAdminRecruiter = (req, res, next) => {
  const user = req.user;

  const isAdminRecruiter =
    user?.role === 'recruiter' &&
    user?.recruiterProfile?.companyRole === 'admin_recruiter';

  if (isAdminRecruiter) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin recruiter permission required.'
  });
};

const apiCheckRecruiterAccess = async (req, res, next) => {
  try {
    const user = req.user;

    req.recruiterContext = {
      isCompanyAdmin: false,
      companyIsActive: false
    };

    if (user?.role === 'recruiter' && user?.company) {
      const company = await companyModel.findById(user.company).lean();

      if (company) {
        req.recruiterContext.companyIsActive = company.isActive;
        if (user.recruiterProfile?.companyRole === 'admin_recruiter') {
          req.recruiterContext.isCompanyAdmin = true;
        }
      }
    }

    return next();

  } catch (error) {
    // console.error('Error in apiCheckRecruiterAccess:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while checking recruiter access'
    });
  }
};

module.exports = {
  authenticate,
  authorizeRoles,
  checkRecruiterAccess,
  onlyAdminRecruiter,
  apiAuthenticateUser,
  apiAuthorizeRoles,
  apiOnlyAdminRecruiter,
  apiCheckRecruiterAccess
};

