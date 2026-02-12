const mongoose = require('mongoose');

const portalSettingsSchema = new mongoose.Schema({
    portalName: { type: String, required: true },
    portalEmail: { type: String, required: true },
    contactNumber: { type: String, required: true },
    address: { type: String, required: true },
    aboutUs: { type: String, required: true },
    logo: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('PortalSetting', portalSettingsSchema);
