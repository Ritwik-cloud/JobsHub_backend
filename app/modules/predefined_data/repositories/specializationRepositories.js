const userModel = require('../../user/model/userModel');
const specializationModel = require('../model/specializationModel');
const mongoose = require('mongoose');

const specializationRepositories = {

    findSpecializationBynameAndCourse: async (name, course) => {
        return await specializationModel.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') }, course: course })
    },

    addSpecialization: async (data) => {
        const { name, course } = data;
        const specialization = new specializationModel({
            name,
            course
        })
        await specialization.save();
        return specialization;
    },

    getAllSpecializations: async () => {
        const specializations = await specializationModel.aggregate([
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'courseInfo'
                }
            },
            {
                $unwind: { path: '$courseInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $project:{
                    name:1,
                    course:{
                        _id:'$courseInfo._id',
                        name:'$courseInfo.name'
                    }
                }
            }
        ])

        return specializations;
    },

    getSpecializationById: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await specializationModel.findById(id);
    },

    updateSpecialization: async (id, data) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const { name, course } = data;
        return await specializationModel.findByIdAndUpdate(id, { name, course }, { new: true, runValidators: true });
    },

    deleteSpecialization: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await specializationModel.findByIdAndDelete(id);
    },

    getSpecializationsBycourse:async(courseId)=>{
         if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return [];
        }

        console.log('hello');

        return await specializationModel.find({course:courseId});
    },

    isSpecializationUsed: async (specializationId) => {
        if (!mongoose.Types.ObjectId.isValid(specializationId)) {
            return false;
        }

        const usedByUser = await userModel.findOne(
            { 'profile.education.specialization': specializationId },
            { _id: 1 }
        );

        if (usedByUser) {
            return true;
        }

        return false;
    }
}

module.exports = specializationRepositories