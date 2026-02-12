const portalSettingModel=require('../model/portalSettingModel');

const portalSettingRepositories={
    getProtalSettings:async()=>{
        return await portalSettingModel.findOne();
    },

    savePortalSetting:async(data)=>{
        const updatedSetting=await portalSettingModel.findOneAndUpdate({},{
            ...data
        },{upsert:true,new:true});

        return updatedSetting;
    }

}

module.exports=portalSettingRepositories