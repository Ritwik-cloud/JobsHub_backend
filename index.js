const { join, resolve } = require("path");
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const dbConnection = require('./app/config/db');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const cors = require('cors');

dotenv.config();

const app = express();

// ------------------- Database Connection -------------------
dbConnection();

// ------------------- Middleware -------------------

// 1️⃣ CORS middleware (must be first)
app.use(cors({
  origin:[
    "http://localhost:3000",              // For local development
    "https://jobs-hub-op6u.vercel.app"    // For production (Vercel)
  ],
  credentials: true
}));

// 2️⃣ Logging
app.use(morgan('dev'));

// 3️⃣ Body parsing
app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

// 4️⃣ Session, cookie, flash
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(cookieParser());
app.use(flash());

// 5️⃣ Serve static files
app.use(express.static(resolve(join(__dirname, "public"))));
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// ------------------- View Engine -------------------
app.set('view engine', 'ejs');
app.set('views', 'views');

// ------------------- Named Routes -------------------
const namedRouter = require("route-label")(app);

// ------------------- Global URL Generator -------------------
global.generateUrl = (routeName, routeParams = {}) => {
  return namedRouter.urlFor(routeName, routeParams);
};

// ------------------- App Config -------------------
const appConfig = require(resolve(join(__dirname, "app/config", "index")));
const utils = require(resolve(join(__dirname, "app/helper", "utils")));

const getPort = appConfig.appRoot.port;
const getHost = appConfig.appRoot.host;
const isProduction = appConfig.appRoot.isProd;
const getApiFolderName = appConfig.appRoot.getApiFolderName;
const getHomeFolderName = appConfig.appRoot.getHomeFolderName;
const getRecruiterFolderName = appConfig.appRoot.getRecruiterFolderName;
const getAdminFolderName = appConfig.appRoot.getAdminFolderName;
const getCandidateFolderName = appConfig.appRoot.getCandidateFolderName;

// Flash messages setup
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  next();
});

// ------------------- Error Handler -------------------
const onError = (error) => {
  const bind = typeof getPort === "string" ? "Pipe " + getPort : "Port " + getPort;

  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(0);
      break;
    default:
      throw error;
  }
};

// ------------------- Routes Loader -------------------
(async () => {
  try {
    await require(resolve(join(__dirname, "./app/config", "db")), () => {
      console.log("Database Connected Successfully");
    });

    // Load portal settings middleware
    const loadPortalSettings = require('./app/middleware/loadPortalSettings');
    app.use(loadPortalSettings);

    // --------- Load API Routes ---------
    const apiFiles = await utils._readdir(`./app/router/${getApiFolderName}`);
    apiFiles.forEach(file => {
      if (!file || file[0] === ".") return;
      namedRouter.use("/api", require(join(__dirname, file)));
    });

    // --------- Load Home Routes ---------
    const homeFiles = await utils._readdir(`./app/router/${getHomeFolderName}`);
    homeFiles.forEach(file => {
      if (!file || file[0] === ".") return;
      namedRouter.use("/", require(join(__dirname, file)));
    });

    // --------- Load Admin Routes ---------
    const adminFiles = await utils._readdir(`./app/router/${getAdminFolderName}`);
    adminFiles.forEach(file => {
      if (!file || file[0] === ".") return;
      namedRouter.use("/", require(join(__dirname, file)));
    });

    // --------- Load Recruiter Routes ---------
    const recruiterFiles = await utils._readdir(`./app/router/${getRecruiterFolderName}`);
    recruiterFiles.forEach(file => {
      if (!file || file[0] === ".") return;
      namedRouter.use("/", require(join(__dirname, file)));
    });

    // --------- Load Candidate Routes ---------
    const candidateFiles = await utils._readdir(`./app/router/${getCandidateFolderName}`);
    candidateFiles.forEach(file => {
      if (!file || file[0] === ".") return;
      namedRouter.use("/", require(join(__dirname, file)));
    });

    // Build route table for debugging
    namedRouter.buildRouteTable();

    if (!isProduction && process.env.SHOW_NAMED_ROUTES === "true") {
      const apiRouteList = namedRouter.getRouteTable("/api");
      const userRouteList = namedRouter.getRouteTable("/");
      // console.log("API Routes:", apiRouteList);
      // console.log("User Routes:", userRouteList);
    }

    // ------------------- Start Server -------------------
    app.listen(getPort);
    app.on("error", onError);

    console.log(`Project is running on http://${getHost}:${getPort}`);
  } catch (error) {
    console.log(error);
  }
})();