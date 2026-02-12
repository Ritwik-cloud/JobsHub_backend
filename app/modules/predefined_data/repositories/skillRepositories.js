const jobModel = require("../../job/model/jobModel");
const userModel = require("../../user/model/userModel");
const skillModel = require("../model/skillModel");
const mongoose = require('mongoose');

const skillRepositories = {
    addSkill: async (data) => {
        const { name, normalized } = data;
        const skill = new skillModel({
            name,
            normalized
        })
        await skill.save();
        return skill;
    },

    getAllSkills: async () => {
        return await skillModel.find({}).select('name');

    },

    findSkillByNormalizedName: async (normalizedName) => {
        return await skillModel.findOne({ normalized: normalizedName })
    },

    getSkillsByNormalizedName:async(normalizedName)=>{
          return await skillModel.find({ normalized: {$regex: normalizedName, $options: 'i' } }).limit(5);
    },

    getSkillById: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await skillModel.findById(id);
    },

    updateSkill: async (id, data) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const { name, normalized } = data;
        return await skillModel.findByIdAndUpdate(id, { name, normalized }, { new: true, runValidators: true });
    },

    deleteSkill: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await skillModel.findByIdAndDelete(id);
    },

    searchSkillByNormalizedName: async (data)=>{

        const skills = await skillModel.find({
            normalized: { $regex: data, $options: 'i' }
        }).limit(10);

        return skills;
    },

    findSkillsByIds:async(skillIds)=>{
        return await skillModel.find({_id:{$in:skillIds}});
    },

    isSkillUsedInJob: async (skillId) => {
            if (!mongoose.Types.ObjectId.isValid(skillId)) {
                return false;
            }
    
            const job=await jobModel.findOne({skillsRequired:skillId});
    
            return job;
    
        },

        isSkillUsedInCandidate:async(skillId)=>{
                 if (!mongoose.Types.ObjectId.isValid(skillId)) {
                    return false;
                }
        
                const user = await userModel.findOne(
                    {
                        $or: [
                            { 'profile.skills': skillId },
                            { 'profile.workExperience.skillsUsed': skillId }
                        ]
                    },
                    { _id: 1 }
                );
        
                return user;
            }


}

module.exports = skillRepositories;