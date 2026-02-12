const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      required: true,
      enum: [
        "Tenth",
        "Twelfth",
        "Diploma",
        "Graduation",
        "Post Graduation",
        "PhD",
        "Other",
      ],
    },
    boardOrUniversity: { type: String },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    specialization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialization",
    },
    marksPercentage: { type: Number },
    passingOutYear: { type: String },
    durationFrom: { type: String },
    durationTo: { type: String },
  },
  { _id: true }
);

const workExperienceSchema = new mongoose.Schema(
  {
    companyName: { type: String },
    currentEmployment: { type: Boolean },
    jobTitle: { type: String },
    joiningDate: { type: Date },
    workTillDate: { type: Date },
    skillsUsed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
    jobProfile: { type: String },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    link: {
      type: String,
    },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["admin", "recruiter", "candidate"],
      default: "candidate",
    },
    isActive: { type: Boolean, default: true },
    isRemoved: { type: Boolean, default: false },
    profilePicture: { type: String },

    // Only for recruiters
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },

    recruiterProfile: {
      type: new mongoose.Schema(
        {
          designation: { type: String },
          department: { type: String },
          phoneNumber: { type: String },
          approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
          },
          rejectionReason: { type: String },
          isActive: { type: Boolean, default: true },

          companyRole: {
            type: String,
            enum: ["admin_recruiter", "basic_recruiter"],
            default: "basic_recruiter",
            required: true,
          },
        },
        { _id: false }
      ),
      default: undefined,
    },

    // Candidate-specific profile
    profile: {
      type: new mongoose.Schema(
        {
          dob: { type: Date },
          phone: { type: String },
          gender: { type: String, enum: ["male", "female"] },
          workstatus: { type: String, enum: ["fresher", "experienced"] },
          availabiltyToJoin: { type: Number, enum: [15, 30] },
          totalExperience: {
            years: { type: Number, default: 0 },
            months: { type: Number, default: 0 },
          },
          currentSalary: { type: Number },
          address: { type: String },
          profileSummary: { type: String },
          skills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
          workExperience: [workExperienceSchema],

          education: [educationSchema],
          projects: [projectSchema],

          resume: {
            path: { type: String },
            originalName: { type: String },
          },
          linkedInProfile: { type: String },
          preferredIndustry: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Industry",
          },
          preferredJobCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobCategory",
          },
          preferredWorkMode: [
            {
              type: String,
              enum: ["work from office", "work from home", "remote", "hybrid"],
            },
          ],
          prefferedShift: { type: String, enum: ["day", "night", "flexible"] },
          preferredLocations: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
          ],

          bookmarkedJobs: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Job",
            },
          ],
        },
        { _id: false }
      ),
      default: undefined,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
