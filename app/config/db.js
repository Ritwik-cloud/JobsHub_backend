
// 3rd-party module
const mongoose = require("mongoose");
require('dotenv').config();

// Define database connection Funciton

  const connection = async () => {
    try {
       await mongoose.connect(process.env.MONGO_URI);
      console.log("Connected to Mongodb Database");
    } catch (error) {
      console.log(`Error in Mongodb database ${error}`);
    }
  };

module.exports = connection;