const portalSettingRepositories = require("../repositories/portalSettingRepositories");
const { portalSettingsValidationSchema } = require("../validation/portalSettingValidation");
const fs = require('fs').promises;

class PortalSettingController {
    async portalSettingPage(req, res) {
        try {
            const portalSettings = await portalSettingRepositories.getProtalSettings();
            return res.render('admin/portal-setting', { title: 'Portal Setting', portalSettings });
        } catch (error) {
            console.log(error);
        }
    }

    async savePortalSetting(req, res) {
        try {
            console.log(req.body);
            const { error, value } = portalSettingsValidationSchema.validate(req.body, { abortEarly: false });
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

            const existingSetting = await portalSettingRepositories.getProtalSettings();
            if (!existingSetting && !req.file) {
                return res.status(400).json({
                    status: false,
                    errors: {
                        logo: 'Logo is required.'
                    }
                })
            }

            const { portalName, portalEmail, contactNumber, address, aboutUs } = value;

            const logoFile = req.file;

            let logoPath = existingSetting?.logo;

            if (logoFile) {
                logoPath = `uploads/portal/${req.file.filename}`

                try {
                    await fs.access(existingSetting.logo)
                    await fs.unlink(existingSetting.logo);
                } catch (error) {
                    if (error.code !== 'ENOENT') {
                        console.error('Error deleting old image:', error);
                    }
                }

            }

            const updatedSetting = await portalSettingRepositories.savePortalSetting({
                portalName,
                portalEmail,
                contactNumber,
                address,
                aboutUs,
                logo: logoPath
            });

            return res.status(200).json({
                status: true,
                message: 'Portal settings saved successfully.',
                data: updatedSetting
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }
}

module.exports = new PortalSettingController();