const portalSettingModel=require('../modules/portal_setting/model/portalSettingModel');

const loadPortalSettings = async (req, res, next)=> {
    try {
        const setting = await portalSettingModel.findOne();
        res.locals.portalSetting = setting || {}; 
    } catch (err) {
        console.error('Failed to load portal settings:', err);
        res.locals.portalSetting = {};
    }
    next();
};

module.exports=loadPortalSettings;