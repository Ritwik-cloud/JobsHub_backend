module.exports = {
    // Define application configuration
    appRoot: {
      env: process.env.NODE_ENV || "development",
      isProd: process.env.NODE_ENV === "production",
      host: process.env.HOST || "localhost",
      port: process.env.PORT || 3005,
      appName: process.env.APP_NAME || "job_portal",
      getApiFolderName: process.env.API_FOLDER_NAME || "api",
      getHomeFolderName: process.env.INDEX_FOLDER_NAME || "home",
      getRecruiterFolderName: process.env.RECRUITER_FOLDER_NAME || "recruiter",
      getAdminFolderName: process.env.ADMIN_FOLDER_NAME || "admin",
      getCandidateFolderName: process.env.CANDIDATE_FOLDER_NAME || "candidate",

    },
  };
  