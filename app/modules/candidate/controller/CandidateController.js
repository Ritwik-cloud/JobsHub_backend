const industryRepositories = require("../../predefined_data/repositories/industryRepositories");
const jobCategoryRepositories = require("../../predefined_data/repositories/jobcategoryRepositories");
const skillRepositories = require("../../predefined_data/repositories/skillRepositories");
const locationRepositories = require("../../predefined_data/repositories/locationRepositories");

const candidateRepositories = require("../repositories/candidateRepositories");
const Joi = require('joi');
const fs = require('fs').promises;
const mongoose = require('mongoose');
const courseRepositories = require("../../predefined_data/repositories/CourseRepositories");
const specializationRepositories = require("../../predefined_data/repositories/specializationRepositories");
const applicationRepositories = require("../../application/repositories/applicationRepositories");
const jobRepositories = require("../../job/repositories/JobRepositories");
const isValidObjectId = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message('any.invalid');
    }
    return value;
};

class CandidateController {
    async dashboard(req, res) {
        try {
            const userId = req.user._id;
            const candidateDetail = await candidateRepositories.findCandidateById(userId);
            const { applicationsCount, acceptedApplicationsCount, pendingApplicationsCount } = await applicationRepositories.getApplicationCounts(userId);
            const { recommendedJobs, totalRecommendedJobs } = await jobRepositories.getRecommendedJobs(userId);

            const previewRecommendedJobs = recommendedJobs.slice(0, 3);

            return res.render('candidate/dashboard', { title: 'Dashboard', candidateDetail, applicationsCount, acceptedApplicationsCount, pendingApplicationsCount, recommendedJobs: previewRecommendedJobs, totalRecommendedJobs });
        } catch (error) {
            console.log(error);
        }
    }

    async profilePage(req, res) {
        try {
            const id = req.user._id;
            // const candidate = await candidateRepositories.getCandidateProfileById(id);
            const industriesToselect = await industryRepositories.getAllIndustries();
            const jobCategoriesToselect = await jobCategoryRepositories.getAllJobCategories();

            const candidateBasic = await candidateRepositories.getCandidateBasicDetails(id);
            const candidateProfileSummary = await candidateRepositories.getCandidateProfileSummary(id);
            const candidateSkills = await candidateRepositories.getCandidateSkills(id);
            const candidateWorkExperiences = await candidateRepositories.getCandidateWorkExperiences(id);
            const candidateEducations = await candidateRepositories.getCandidateEducations(id);
            const candidatePreferences = await candidateRepositories.getCandidateCareerPreference(id);
            const candidateResume = await candidateRepositories.getCandidateResume(id);
            const candidateProjects = await candidateRepositories.getCandidateProjects(id);


            // console.log(candidateBasic);
            const candidateData = {
                ...candidateBasic,
                profile: {
                    ...candidateBasic.profile,
                    profileSummary: candidateProfileSummary,
                    skills: candidateSkills,
                    workExperience: candidateWorkExperiences,
                    education: candidateEducations,
                    preferredIndustry: candidatePreferences.preferredIndustry,
                    preferredJobCategory: candidatePreferences.preferredJobCategory,
                    preferredWorkMode: candidatePreferences.preferredWorkMode,
                    prefferedShift: candidatePreferences.prefferedShift,
                    preferredLocations: candidatePreferences.preferredLocations,
                    resume: candidateResume,
                    projects: candidateProjects
                }

            }
            // console.log(candidateData);

            return res.render('candidate/profile', {
                title: 'Profile',
                // candidate,
                industriesToselect,
                jobCategoriesToselect,
                candidateData

            });
        } catch (error) {
            console.log(error);
        }
    }

    async getCandidateBasicDetails(req, res) {
        try {
            const id = req.user._id;
            const candidate = await candidateRepositories.getCandidateBasicDetails(id);
            // console.log(candidate);
            return res.status(200).json({
                status: true,
                message: 'Data fetched successfully',
                data: candidate
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later'
            });
        }
    }

    async updateCandidateBsicDetail(req, res) {
        try {
            // console.log(req.body);
            const basicDetailsSchema = Joi.object({
                name: Joi.string().required().trim().messages({
                    'any.required': 'Name is required',
                    'string.empty': 'Name cannot be empty'
                }),
                dob: Joi.date().required().messages({
                    'any.required': 'Date of birth is required',
                    'date.base': 'Invalid date format'
                }),
                phone: Joi.string().pattern(/^[0-9]{10}$/).messages({
                    'string.pattern.base': 'Phone number must be 10 digits'
                }),
                gender: Joi.string().valid('male', 'female').required().messages({
                    'any.only': 'Gender must be Male or Female',
                    'any.required': 'Gender is required'
                }),
                address: Joi.string().required().trim().message({
                    'any.required': 'Address is required'
                }),
                workstatus: Joi.string().valid('fresher', 'experienced').required().messages({
                    'any.only': 'Invalid work status',
                    'any.required': 'Work status is required'
                }),
                totalExperience: Joi.object({
                    years: Joi.number().integer().required().messages({
                        'any.required': 'Experience years is required'
                    }),
                    months: Joi.number().integer().min(0).max(11).required().messages({
                        'number.base': 'Months must be a number',
                        'number.min': 'Months must be at least 0',
                        'number.max': 'Months must be less than 12'
                    })
                }).required(),

                currentSalary: Joi.number().required().messages({
                    'number.base': 'Current salary must be a number',
                    'any.required': 'Current salary is required'
                }),

                availabilityToJoin: Joi.number().valid(15, 30).required().messages({
                    'any.only': 'Availability must be 15 or 30 days',
                    'any.required': 'Availability is required'
                })
            });

            const fieldKeyMap = {
                'name': 'name',
                'dob': 'dob',
                'phone': 'phone',
                'gender': 'gender',
                'address': 'address',
                'workstatus': 'workstatus',
                'totalExperience.years': 'experienceYears',
                'totalExperience.months': 'experienceMonths',
                'currentSalary': 'currentSalary',
                'availabilityToJoin': 'availabilityToJoin'
            };


            const { error, value } = basicDetailsSchema.validate(req.body, { abortEarly: false });
            if (error) {
                const errors = {};
                error.details.forEach(err => {
                    const path = err.path.join('.')
                    const key = fieldKeyMap[path] || path;
                    errors[key] = err.message;
                });
                return res.status(400).json({
                    status: false,
                    errors
                });
            }

            const userId = req.user._id;
            const updatedCandidate = await candidateRepositories.updateCandidateBasicDetails(userId, value);
            if (!updatedCandidate) {
                return res.status(404).json({
                    status: false,
                    message: 'Candidate is not found.'
                })
            }

            // console.log(updatedCandidate);

            return res.status(200).json({
                status: true,
                message: 'Candidate basic details updated successfully.',
                data: updatedCandidate
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later'
            });
        }
    }

    async updateProfileImage(req, res) {
        try {
            const candidate = await candidateRepositories.findCandidateById(req.user._id);
            let profilePicture = req.file ? `uploads/user/${req.file.filename}` : candidate.profilePicture;
            // console.log(profilePicture);

            const updatedCandidate = await candidateRepositories.updateCandidateProfilePicture(req.user._id, profilePicture);

            //   console.log(updatedCandidate);

            if (!updatedCandidate) {
                return res.status(404).json({
                    status: false,
                    message: 'Candidate is not found.'
                })
            }

            if (req.file && candidate.profilePicture) {
                try {
                    await fs.access(candidate.profilePicture)
                    await fs.unlink(candidate.profilePicture);
                } catch (error) {
                    if (error.code !== 'ENOENT') {
                        console.error('Error deleting old image:', error);
                    }
                }

            }

            // console.log(updatedCandidate);

            return res.status(200).json({
                status: true,
                message: 'Candidate Profile picture updated successfully.',
                data: updatedCandidate
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later'
            });
        }
    }

    async getCandidateProfileSummary(req, res) {
        try {
            const id = req.user._id;
            const profileSummary = await candidateRepositories.getCandidateProfileSummary(id);
            // console.log(profileSummary);
            return res.status(200).json({
                status: true,
                message: 'Data fetched successfully',
                data: profileSummary
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later'
            });
        }
    }

    async updateCandidateProfileSummary(req, res) {
        try {
            const { profileSummary } = req.body;
            const userId = req.user._id;
            const updatedCandidate = await candidateRepositories.updateCandidateProfileSummary(userId, profileSummary);
            if (!updatedCandidate) {
                return res.status(404).json({
                    status: false,
                    message: 'Candidate is not found.'
                })
            }

            // console.log(updatedCandidate);

            return res.status(200).json({
                status: true,
                message: 'Candidate profile summary updated successfully.',
                data: updatedCandidate
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later'
            });
        }
    }

    async getCandidateSkills(req, res) {
        try {
            const id = req.user._id;
            const skills = await candidateRepositories.getCandidateSkills(id);
            // console.log(skills);
            return res.status(200).json({
                status: true,
                message: 'Data fetched successfully',
                data: skills
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later'
            });
        }
    }

    async updateCandidateSkills(req, res) {
        try {
            const { skills } = req.body;
            const userId = req.user._id;
            const updatedCandidate = await candidateRepositories.updateCandidateSkills(userId, skills);
            if (!updatedCandidate) {
                return res.status(404).json({
                    status: false,
                    message: 'Candidate is not found.'
                })
            }

            // console.log(updatedCandidate);

            return res.status(200).json({
                status: true,
                message: 'Candidate Skils updated successfully.',
                data: updatedCandidate
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async addCandidateEducation(req, res) {
        try {
            const userId = req.user._id;
            const {
                level,
                boardOrUniversity,
                course,
                specialization,
                marksPercentage,
                passingOutYear,
                durationFrom,
                durationTo } = req.body;

            const educationValidationSchema = Joi.object({
                level: Joi.string()
                    .valid('Tenth', 'Twelfth', 'Diploma', 'Graduation', 'Post Graduation', 'PhD', 'Other')
                    .required()
                    .messages({
                        'any.required': 'Education level is required.',
                        'any.only': 'Education level must be one of Tenth, Twelfth, Diploma, Graduation, Post Graduation, PhD, or Other.',
                        'string.base': 'Education level must be a string.'
                    }),

                boardOrUniversity: Joi.string()
                    .required()
                    .messages({
                        'string.base': 'Board or University must be a string.'
                    }),

                course: Joi.string().custom(isValidObjectId, 'ObjectId validation')
                    .allow('', null)
                    .messages({
                        'string.base': 'Course must be a string.',
                        'any.invalid': 'Invalid course ID'
                    }),

                specialization: Joi.string().custom(isValidObjectId, 'ObjectId validation')
                    .allow('', null)
                    .messages({
                        'string.base': 'Specialization must be a string.',
                        'any.invalid': 'Invalid specialization ID'
                    }),

                marksPercentage: Joi.number()
                    .min(0)
                    .max(100)
                    .messages({
                        'number.base': 'Marks percentage must be a number.',
                        'number.min': 'Marks percentage cannot be less than 0.',
                        'number.max': 'Marks percentage cannot be more than 100.'
                    }),

                passingOutYear: Joi.string()
                    .pattern(/^\d{4}$/)
                    .allow('', null)
                    .messages({
                        'string.pattern.base': 'Passing out year must be a 4-digit year.',
                        'string.base': 'Passing out year must be a string.'
                    }),

                durationFrom: Joi.string()
                    .allow('', null)
                    .messages({
                        'string.base': 'Duration from must be a string.'
                    }),

                durationTo: Joi.string()
                    .allow('', null)
                    .messages({
                        'string.base': 'Duration to must be a string.'
                    }),
            });

            const { error, value } = educationValidationSchema.validate(req.body, { abortEarly: false });
            if (error) {
                console.log(error);
                const errors = {};
                error.details.forEach(err => {
                    errors[err.path[0]] = err.message;
                });
                return res.status(400).json({
                    status: false,
                    errors
                });
            }



            const candidate = await candidateRepositories.findCandidateById(userId);
            if (!candidate) {
                return res.status(404).json({
                    status: false,
                    message: "Candidate is not found.",
                });
            }
            const existingEducations = candidate.profile?.education || [];

            const duplicate = existingEducations.some(
                (edu) => edu.level === level
            );

            if (duplicate) {
                return res.status(400).json({
                    status: false,
                    message: 'This education level already exists.',
                });
            }

            const newEducation = {
                level,
                boardOrUniversity,
                course: course ? course : null,
                specialization: specialization ? specialization : null,
                marksPercentage,
                passingOutYear: passingOutYear ? passingOutYear : null,
                durationFrom: durationFrom ? durationFrom : null,
                durationTo: durationTo ? durationTo : null
            }

            // const updatedCandidate = await candidateRepositories.addCandidateEducation(userId, {
            //     level,
            //     boardOrUniversity,
            //     course,
            //     specialization,
            //     marksPercentage,
            //     passingOutYear,
            //     durationFrom,
            //     durationTo
            // });

            const updatedCandidate = await candidateRepositories.addCandidateEducation(userId, newEducation);

            const courseDoc = newEducation.course ? await courseRepositories.getCourseById(newEducation.course) : null;
            const specializationDoc = newEducation.specialization ? await specializationRepositories.getSpecializationById(newEducation.specialization) : null;

            // const addedEducationEntry = updatedCandidate.profile.education[updatedCandidate.profile.education.length - 1];

            const addedEducationEntry = {
                ...newEducation,
                course: courseDoc?.name || null,
                specialization: specializationDoc?.name || null
            };

            return res.status(201).json({
                status: true,
                message: `Education added successfully.`,
                data: addedEducationEntry
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async deleteCandidateEducation(req, res) {
        try {
            const userId = req.user._id;
            const eduId = req.params.id;

            const updatedCandidate = await candidateRepositories.deleteCandidateEducation(userId, eduId);
            if (!updatedCandidate) {
                return res.status(404).json({
                    status: false,
                    message: 'Candidate is not found.'
                })
            }

            // console.log(updatedCandidate);

            return res.status(200).json({
                status: true,
                message: 'Candidate Education deleted successfully.',
                data: updatedCandidate
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async addCandidateWorkExperience(req, res) {
        try {
            const workExperienceSchema = Joi.object({
                companyName: Joi.string()
                    .trim()
                    .min(2)
                    .max(100)
                    .required()
                    .messages({
                        'string.base': 'Company name should be a string.',
                        'string.empty': 'Company name is required.',
                        'string.min': 'Company name should have a minimum length of {#limit} characters.',
                        'string.max': 'Company name should have a maximum length of {#limit} characters.',
                        'any.required': 'Company name is a required field.'
                    }),

                currentEmployment: Joi.boolean()
                    .required()
                    .messages({
                        'boolean.base': 'Current employment status must be a boolean (true/false).',
                        'any.required': 'Please specify if you are currently employed here.'
                    }),

                jobTitle: Joi.string()
                    .trim()
                    .min(2)
                    .max(100)
                    .required()
                    .messages({
                        'string.base': 'Job title should be a string.',
                        'string.empty': 'Job title is required.',
                        'string.min': 'Job title should have a minimum length of {#limit} characters.',
                        'string.max': 'Job title should have a maximum length of {#limit} characters.',
                        'any.required': 'Job title is a required field.'
                    }),

                joiningDate: Joi.date()
                    .iso()
                    .required()
                    .messages({
                        'date.base': 'Joining date must be a valid date.',
                        'date.iso': 'Joining date must be in YYYY-MM-DD format.',
                        'any.required': 'Joining date is a required field.'
                    }),


                workTillDate: Joi.date()
                    .iso()
                    .less('now')
                    .when('currentEmployment', {
                        is: false,
                        then: Joi.date().required().messages({
                            'date.base': 'Work till date must be a valid date.',
                            'date.iso': 'Work till date must be in YYYY-MM-DD format.',
                            'date.less': 'Work till date cannot be in the future.',
                            'any.required': 'Work till date is required if you are not currently employed.'
                        }),
                        otherwise: Joi.date().allow('', null)
                            .messages({
                                'date.base': 'Work till date must be a valid date.',
                                'date.iso': 'Work till date must be in YYYY-MM-DD format.',
                                'date.less': 'Work till date cannot be in the future.'
                            })
                    }),


                skillsUsed: Joi.array().items(Joi.string())
                    .messages({
                        'array.base': 'Skills used must be an array.',
                        'array.items': 'Each skill must be a valid identifier.'
                    }),

                jobProfile: Joi.string()
                    .trim()
                    .max(200)
                    .allow('')
                    .messages({
                        'string.base': 'Job profile should be text.',
                        'string.max': 'Job profile description is too long. Please keep it under {#limit} characters.'
                    })
            });

            // console.log(req.body);
            const { currentEmployment, companyName, jobTitle, joiningDate, workTillDate, usedSkillIds, jobProfile } = req.body;

            const isCurrentCompany = currentEmployment === 'true';
            const dataToValidate = {
                companyName: companyName.trim(),
                currentEmployment: isCurrentCompany,
                jobTitle,
                skillsUsed: usedSkillIds,
                joiningDate,
                workTillDate: isCurrentCompany ? null : workTillDate,
                jobProfile
            }
            const { error, value } = workExperienceSchema.validate(dataToValidate, { abortEarly: false });
            if (error) {
                console.log(error);
                const errors = {};
                error.details.forEach(err => {
                    errors[err.path[0]] = err.message;
                });
                return res.status(400).json({
                    status: false,
                    errors
                });
            }

            const existingSkills = await skillRepositories.findSkillsByIds(dataToValidate.skillsUsed);
            if (existingSkills.length !== dataToValidate.skillsUsed.length) {
                return res.status(400).json({
                    status: false,
                    errors: { skillsUsed: "One or more provided skills are invalid or do not exist." }
                });
            }


            const newWorkExperience = {
                companyName: dataToValidate.companyName,
                currentEmployment: dataToValidate.currentEmployment,
                jobTitle: dataToValidate.jobTitle,
                joiningDate: new Date(dataToValidate.joiningDate),
                workTillDate: dataToValidate.workTillDate ? new Date(dataToValidate.workTillDate) : null,
                skillsUsed: dataToValidate.skillsUsed,
                jobProfile: dataToValidate.jobProfile === '' ? null : dataToValidate.jobProfile
            };


            const userId = req.user._id;

            const updatedCandidate = await candidateRepositories.addCandidateWorkExperience(userId, newWorkExperience);

            const addedworkExperience = updatedCandidate.profile.workExperience[updatedCandidate.profile.workExperience.length - 1];

            // console.log(addedworkExperience);

            res.status(201).json({
                status: true,
                message: "Work experience added successfully.",
                data: addedworkExperience
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async deleteCandidateWorkExperience(req, res) {
        try {
            const userId = req.user._id;
            const workExpId = req.params.id;

            const updatedCandidate = await candidateRepositories.deleteCandidateWorkExperience(userId, workExpId);
            if (!updatedCandidate) {
                return res.status(404).json({
                    status: false,
                    message: 'Candidate is not found.'
                })
            }

            // console.log(updatedCandidate);

            return res.status(200).json({
                status: true,
                message: 'Candidate Work Experience deleted successfully.',
                data: updatedCandidate
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async updateCareerPreferences(req, res) {
        try {
            const careerPreferencesSchema = Joi.object({
                preferredIndustry: Joi.string()
                    .required()
                    .custom(isValidObjectId, 'ObjectId validation')
                    .messages({
                        'any.required': 'Industry is required',
                        'string.empty': 'Industry cannot be empty',
                        'any.invalid': 'Invalid industry ID'
                    }),

                preferredJobCategory: Joi.string()
                    .required()
                    .custom(isValidObjectId, 'ObjectId validation')
                    .messages({
                        'any.required': 'Job category is required',
                        'string.empty': 'Job category cannot be empty',
                        'any.invalid': 'Invalid job category ID'
                    }),

                preferredWorkMode: Joi.array()
                    .items(Joi.string().valid('work from office', 'work from home', 'remote', 'hybrid')).min(1).required()
                    .messages({
                        'array.includes': 'One or more selected work modes are invalid',
                        'array.min': 'At least one preferred work mode is required',
                    }),

                prefferedShift: Joi.string()
                    .valid('day', 'night', 'flexible')
                    .required()
                    .messages({
                        'any.only': 'Shift must be day, night, or flexible',
                        'any.required': 'Work shift is required'
                    }),

                preferredLocations: Joi.array()
                    .items(Joi.string().custom(isValidObjectId, 'ObjectId validation'))
                    .min(1)
                    .required()
                    .messages({
                        'array.base': 'Preferred location must be an array',
                        'array.min': 'At least one preferred location is required',
                        'any.required': 'Preferred location is required'
                    })
            });

            const { error, value } = careerPreferencesSchema.validate(req.body, { abortEarly: false });
            if (error) {
                console.log(error);
                const errors = {};
                error.details.forEach(err => {
                    errors[err.path[0]] = err.message;
                });
                return res.status(400).json({
                    status: false,
                    errors
                });
            }

            const { preferredIndustry, preferredJobCategory, preferredWorkMode, prefferedShift, preferredLocations } = value;


            const existingIndustry = await industryRepositories.getIndustryById(preferredIndustry);
            if (!existingIndustry) {
                return res.status(400).json({
                    status: false,
                    errors: { preferredIndustry: 'Industry does not exists.' }
                })
            }

            const existingJobcategory = await jobCategoryRepositories.getJobCategoryById(preferredJobCategory);
            if (!existingJobcategory) {
                return res.status(400).json({
                    status: false,
                    errors: { preferredJobCategory: 'Job Category does not exists.' }
                })
            }

            const existingLocations = await locationRepositories.findLocationsByIds(preferredLocations);
            if (existingLocations.length !== preferredLocations.length) {
                return res.status(400).json({
                    status: false,
                    errors: { preferredLocations: 'one or more locations do not exists.' }
                })
            }

            const userId = req.user._id;
            const candidate = await candidateRepositories.findCandidateById(userId);
            if (!candidate) {
                return res.status(404).json({
                    status: false,
                    message: 'Candidate is not found'
                })
            }

            const updatedCandidate = await candidateRepositories.updateCareerPreferences(userId, value);
            res.status(200).json({
                status: true,
                message: 'Career preferences updated successfully',
                data: updatedCandidate
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getCandidatecarrerPeference(req, res) {
        try {
            const userId = req.user._id;

            const preferences = await candidateRepositories.getCandidateCareerPreference(userId);

            if (!preferences) {
                return res.status(404).json({
                    status: false,
                    message: 'Candidate is not found'
                })
            }

            // console.log(preferences);

            res.status(200).json({
                status: true,
                message: 'Career preferences fetched successfully',
                data: preferences
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async updateCandidateResume(req, res) {
        try {
            const candidate = await candidateRepositories.findCandidateById(req.user._id);
            if (!candidate) {
                return res.status(404).json({
                    status: false,
                    message: 'Candidate is not found.'
                })
            }

            // console.log(candidate.profile.resume);

            let resumePath = req.file ? `uploads/resume/${req.file.filename}` : candidate.profile?.resume?.path;
            // console.log(resumePath);

            const resume = {
                path: resumePath,
                originalName: req.file.originalname
            }

            const updatedCandidate = await candidateRepositories.updateResume(req.user._id, resume);



            if (req.file && candidate.profile?.resume?.path) {
                try {
                    await fs.access(candidate.profile?.resume?.path)
                    await fs.unlink(candidate.profile?.resume?.path);
                } catch (error) {
                    if (error.code !== 'ENOENT') {
                        console.error('Error deleting old resume:', error);
                    }
                }

            }

            return res.status(200).json({
                status: true,
                message: 'Candidate resume updated successfully.',
                data: updatedCandidate.profile.resume
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later'
            });
        }
    }

    async addCandidateProject(req, res) {
        try {
            const pojectSchemaValidation = Joi.object({
                title: Joi.string().trim().required().messages({
                    'any.required': 'Project title is required',
                    'string.empty': 'Project title is required',
                }),
                link: Joi.string().uri().trim().allow('').optional().messages({
                    'string.uri': 'Link to must be a valid URL.'
                }),
                description: Joi.string().max(200).required().messages({
                    'string.base': 'Poject description must be a string',
                    'any.required': 'Project description is required',
                    'string.empty': 'Project description is required',
                })
            })

            const { error, value } = pojectSchemaValidation.validate(req.body, { abortEarly: false });
            if (error) {
                console.log(error);
                const errors = {};
                error.details.forEach(err => {
                    errors[err.path[0]] = err.message;
                });
                return res.status(400).json({
                    status: false,
                    errors
                });
            }

            const { title, description, link } = value;

            const userId = req.user._id;

            const newProject = {
                title,
                description: description,
                link: link ? link : null
            }

            const updatedCandidate = await candidateRepositories.addCandidateProject(userId, newProject);

            const addedProject = updatedCandidate.profile.projects[updatedCandidate.profile.projects.length - 1];

            res.status(200).json({
                status: true,
                message: "Project added successfully.",
                data: addedProject
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later'
            });
        }
    }

    async deleteCandidateProject(req, res) {
        try {
            const userId = req.user._id;
            const projectId = req.params.id;

            const updatedCandidate = await candidateRepositories.deleteCandidateProject(userId, projectId);
            if (!updatedCandidate) {
                return res.status(404).json({
                    status: false,
                    message: 'Candidate is not found.'
                })
            }

            // console.log(updatedCandidate);

            return res.status(200).json({
                status: true,
                message: 'Candidate Work Experience deleted successfully.',
                data: updatedCandidate
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getRecruiterViewOfCandidateProfile(req, res) {
        try {
            const id = req.params.id;

            const candidate = await candidateRepositories.getCandidateProfileById(id);

            const candidateBasic = await candidateRepositories.getCandidateBasicDetails(id);
            const candidateProfileSummary = await candidateRepositories.getCandidateProfileSummary(id);
            const candidateSkills = await candidateRepositories.getCandidateSkills(id);
            const candidateWorkExperiences = await candidateRepositories.getCandidateWorkExperiences(id);
            const candidateEducations = await candidateRepositories.getCandidateEducations(id);
            const candidatePreferences = await candidateRepositories.getCandidateCareerPreference(id);
            const candidateResume = await candidateRepositories.getCandidateResume(id);
            const candidateProjects = await candidateRepositories.getCandidateProjects(id);

             const candidateData = {
                ...candidateBasic,
                profile: {
                    ...candidateBasic.profile,
                    profileSummary: candidateProfileSummary,
                    skills: candidateSkills,
                    workExperience: candidateWorkExperiences,
                    education: candidateEducations,
                    preferredIndustry: candidatePreferences.preferredIndustry,
                    preferredJobCategory: candidatePreferences.preferredJobCategory,
                    preferredWorkMode: candidatePreferences.preferredWorkMode,
                    prefferedShift: candidatePreferences.prefferedShift,
                    preferredLocations: candidatePreferences.preferredLocations,
                    resume: candidateResume,
                    projects: candidateProjects
                }

            }

            return res.render('recruiter/candidate-preview-profile', { title: 'Candidate Profile', candidateData,candidate });

        } catch (error) {
            console.log(error);
        }
    }

    async getManageCandidatePage(req, res) {
        try {
            return res.render('admin/manage-candidate', { title: 'Manage Candidate' })
        } catch (error) {
            console.log(error);
        }
    }

    async getCandidatesPaginated(req, res) {
        try {
            const { page = 1, limit = 10, search, status } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
            }

            const filters = {
                status,
                search
            }

            const { candidates, totalCount, totalPages } = await candidateRepositories.getCandidatesPaginated(options, filters);

            return res.status(200).json({
                status: true,
                message: 'Candidates has been fetched successfully',
                data: candidates,
                totalRecords: totalCount,
                page: parseInt(page),
                totalPages: totalPages
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later'
            });
        }
    }

    async deactivateCandidate(req, res) {
        try {
            const candidateId = req.params.id;

            const candidate = await candidateRepositories.findCandidateById(candidateId);

            if (!candidate) {
                return res.status(404).json({
                    status: false,
                    message: 'Candidate is not found'
                })
            }

            if (candidate.isActive === false) {
                return res.status(400).json({
                    status: false,
                    message: 'Candidate is already deactive'
                })
            }

            const updatedcandidate = await candidateRepositories.deactivateCandidate(candidateId);

            return res.status(200).json({
                status: true,
                message: `${candidate.name} is deactivated successfully`
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async activateCandidate(req, res) {
        try {
            const candidateId = req.params.id;

            const candidate = await candidateRepositories.findCandidateById(candidateId);

            if (!candidate) {
                return res.status(404).json({
                    status: false,
                    message: 'Candidate is not found'
                })
            }

            if (candidate.isActive === true) {
                return res.status(400).json({
                    status: false,
                    message: 'Candidate is already active'
                })
            }

            const updatedcandidate = await candidateRepositories.activateCandidate(candidateId);

            return res.status(200).json({
                status: true,
                message: `${candidate.name} is deactivated successfully`
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async removeCandidate(req, res) {
        try {
            const candidateId = req.params.id;

            const candidate = await candidateRepositories.findCandidateById(candidateId);

            if (!candidate) {
                return res.status(404).json({
                    status: false,
                    message: 'Candidate is not found'
                })
            }

            const updatedcandidate = await candidateRepositories.removeCandidate(candidateId);

            return res.status(200).json({
                status: true,
                message: `${candidate.name} is removed successfully`
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getUpdatePasswordPage(req, res) {
        try {
            return res.render('candidate/update-password', { title: 'Update Password' })
        } catch (error) {
            console.log(error);
        }
    }

}

module.exports = new CandidateController();