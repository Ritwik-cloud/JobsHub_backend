const userModel = require('../../user/model/userModel');
const courseModel = require('../model/courseModel');
const mongoose = require('mongoose');
const specializationModel = require('../model/specializationModel');

const courseRepositories = {

    findCourseByname: async (name) => {
        return await courseModel.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } })
    },

    addCourse: async (data) => {
        const { name, educationLevel } = data;
        const course = new courseModel({
            name,
            educationLevel
        })
        await course.save();
        return course;
    },

    getAllCourses: async () => {
        return await courseModel.find({});
    },

    getCourseById: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await courseModel.findById(id);
    },

    updateCourse: async (id, data) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const { name, educationLevel } = data;
        return await courseModel.findByIdAndUpdate(id, { name, educationLevel }, { new: true, runValidators: true });
    },

    deleteCourse: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await courseModel.findByIdAndDelete(id);
    },

    getCoursesByEducationLevel:async(level)=>{
        return await courseModel.find({educationLevel:level})
    },

    isCourseUsed: async (courseId) => {
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return false;
        }

        const usedByUser = await userModel.findOne(
            { 'profile.education.course': courseId },
            { _id: 1 }
        );

        if (usedByUser) {
            return true;
        }

        const hasSpecializations = await specializationModel.findOne(
            { course: courseId },
            { _id: 1 }
        );

        if (hasSpecializations) {
            return true;
        }

        return false;
    }
}

module.exports = courseRepositories