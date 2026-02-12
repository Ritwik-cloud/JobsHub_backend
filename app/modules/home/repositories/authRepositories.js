const transporter = require("../../../config/emailConfig");
const { hassPassword } = require("../../../helper/password");
const companyModel = require("../../company/model/companyModel");
const userModel = require("../../user/model/userModel");
const otpModel = require('../../user/model/otpModel');
const mongoose = require('mongoose');
const slugify = require('slugify');


const authRepositories = {
    findUserByEmail: async (email) => {
        return userModel.findOne({ email: email });
    },

    findCandidateOrAdminByEmail: async (email) => {
        return userModel.findOne({ email: email, role: { $in: ['candidate', 'admin'] } });
    },
    findRecruiterByEmail: async (email) => {
        return userModel.findOne({ email: email, role: 'recruiter' });
    },

    createRecruiter: async (data) => {
        const { name, email, password, designation, company, isNewCompany, companyId, website } = data;
        const hassedPassword = await hassPassword(password);

        const newUser = new userModel({
            name,
            email,
            role: 'recruiter',
            password: hassedPassword,
            recruiterProfile: {
                designation: designation
            }
        })

        // console.log(data);

        await newUser.save();

        // let existingComapny = await companyModel.findOne({ name: new RegExp('^' + company + '$', 'i') });

        let companyDoc;
        if (isNewCompany) {
            companyDoc = new companyModel({
                name: company,
                slug: slugify(company, { lower: true, strict: true }),
                website: website,
                createdBy: newUser._id,
                recruiters: [newUser._id],
                isActive: false
            })
            await companyDoc.save();

            newUser.company = companyDoc._id;
            // newUser.recruiterProfile.isApproved = true;
            newUser.recruiterProfile.approvalStatus = 'approved';
            newUser.recruiterProfile.companyRole = 'admin_recruiter';
        } else {

            if (!companyId) {
                throw new Error("Company ID is missing for existing company registration.");
            }
            companyDoc = await companyModel.findById(companyId);


            if (!companyDoc) {
                throw new Error("Selected company not found.");
            }

            newUser.company = companyDoc._id;
            newUser.recruiterProfile.companyRole = 'basic_recruiter';
            newUser.recruiterProfile.approvalStatus = 'pending';

            if (!companyDoc.recruiters.includes(newUser._id)) {
                companyDoc.recruiters.push(newUser._id);

                await companyDoc.save();
            }

        }
        await newUser.save();


        return newUser;

    },

    createCandidate: async (data) => {
        const { name, email, password } = data;
        const hassedPassword = await hassPassword(password);

        const newUser = new userModel({
            name,
            email,
            role: 'candidate',
            password: hassedPassword
        })

        await newUser.save();

        return newUser;
    },

    getUserById: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await userModel.findById(id);

    },

    emailverifyUser: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await userModel.findByIdAndUpdate(id, { isVerified: true }, { new: true, runValidators: true });
    },

    updatePassword: async (id, password) => {
        const hassedPassword = await hassPassword(password);
        return await userModel.findByIdAndUpdate(id, { $set: { password: hassedPassword } }, { new: true });
    },

    addFotgerPasswordOtp: async (data) => {
        const newOtp = new otpModel({
            userId: data.userId,
            email: data.email,
            otp: await hassPassword(data.otp)
        });

        await newOtp.save();

        console.log(newOtp);

        return newOtp;

    },
    deleteOpt: async (userId) => {
        return otpModel.deleteMany({ userId: userId });
    },
    findOtp: async (userId, email) => {
        return otpModel.findOne({ userId: userId, email: email });
    },
    deleteOtp: async (id) => {
        return otpModel.deleteOne({ _id: id });
    }
}

module.exports = authRepositories