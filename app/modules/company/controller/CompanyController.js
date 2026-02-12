const companyRepositories = require("../repositories/companyRepositories");
const Joi = require('joi');
const { companyValidationSchema } = require("../validation/companyValidationSchema");
const recruiterRepositories = require("../../recruiter/repositories/recruiterRepositories");
const portalSettingRepositories = require("../../portal_setting/repositories/portalSettingRepositories");
const { sendMail } = require('../../../helper/sendMail');
const fs = require('fs').promises;

class CompanyController {
    async searchComanyByName(req, res) {
        try {
            const search = req.query.name;
            console.log(search);
            if (!search) {
                return res.status(200).json([])
            }
            const comapnies = await companyRepositories.findCompanyByname(search);
            // console.log(comapnies);
            return res.status(200).json(comapnies);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later'
            })
        }
    }

    async getCompanyPage(req, res) {
        try {
            const companyId = req.user.companyId;
            const company = await companyRepositories.getCompanyById(companyId);

            return res.render('recruiter/manage-company', { title: 'Manage Company', company });
        } catch (error) {
            console.log(error);
        }
    }

    async updateCompany(req, res) {
        try {
            const id = req.params.id;

            const { error, value } = companyValidationSchema.validate(req.body, { abortEarly: false });
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

            const { name, email, website, description } = value;

            // const existingComapnyName=await companyRepositories.findCompanyByname(name);
            // if(existingComapnyName){
            //      return res.status(400).json({
            //         status: false,
            //         errors: { name: 'This company name is already registered' }
            //     });
            // }

            const company = await companyRepositories.getCompanyById(id);

            // let logo = req.file ? req.file.path : company.logo;
            let logo = req.file
                ? `uploads/companyLogo/${req.file.filename}`
                : company.logo;

            const updatedCompany = await companyRepositories.updateCompany(id, { ...value, logo })
            if (!updatedCompany) {
                return res.status(400).json({
                    status: false,
                    message: 'Company is not found.'
                })
            }

            if (req.file && company.logo) {
                try {
                    await fs.access(company.logo)
                    await fs.unlink(company.logo);
                } catch (error) {
                    if (error.code !== 'ENOENT') {
                        console.error('Error deleting old image:', error);
                    }
                }

            }

            return res.status(200).json({
                status: true,
                message: "Company details has been updated successfully.",
                data: updatedCompany
            })


        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getManageCompaniesPageByAdmin(req, res) {
        try {
            return res.render('admin/manage-companies', { title: 'Manage Company' })
        } catch (error) {
            console.log(error);
        }
    }

    async getCompaniesPaginated(req, res) {
        try {
            const { page = 1, limit = 10,search,status } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
            }

            const filters={
                search,
                status
            }

            const { companies, totalCount, totalPages } = await companyRepositories.getAllCompanies(options,filters);

            return res.status(200).json({
                status: true,
                message: 'Companies has been fetched successfully',
                data: companies,
                totalRecords: totalCount,
                page: parseInt(page),
                totalPages: totalPages
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async activateCompany(req, res) {
        try {
            const companyId = req.params.id;

            const company = await companyRepositories.getCompanyById(companyId);

            if (!company) {
                return res.status(404).json({
                    status: false,
                    message: 'Company is not found'
                })
            }

            if (company.isActive) {
                return res.status(400).json({
                    status: false,
                    message: 'Company is already active'
                })
            }

            const updatedCompany = await companyRepositories.activateCompany(companyId);


            const recruiter = await recruiterRepositories.getRecruiterById(updatedCompany.createdBy);
            const portalSetting = await portalSettingRepositories.getProtalSettings();
            const portalName = portalSetting.portalName || 'CareerBase';

            if (recruiter) {
                const htmlContent = `
Dear Recruiter,
 <br><br>
We are pleased to inform you that your company <strong>${updatedCompany.name}</strong> has been successfully activated on <strong>${portalName}</strong>.
<br><br>
You can now log in and start posting job openings and managing applications.
<br><br>
Best regards,<br><strong>${portalName} Team</strong>
`;
                await sendMail({
                    to: recruiter.email,
                    subject: `Testing Node.js Project-Your Company Is Now Active on ${portalName}`,
                    html: htmlContent
                });
            }

            return res.status(200).json({
                status: true,
                message: `${company.name} is activated successfully`
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async deactivateCompany(req, res) {
        try {
            const companyId = req.params.id;

            const company = await companyRepositories.getCompanyById(companyId);

            if (!company) {
                return res.status(404).json({
                    status: false,
                    message: 'Company is not found'
                })
            }

            if (company.isActive === false) {
                return res.status(400).json({
                    status: false,
                    message: 'Company is already deactive'
                })
            }

            const updatedCompany = await companyRepositories.deactivateCompany(companyId);

            const recruiter = await recruiterRepositories.getRecruiterById(updatedCompany.createdBy);
            const portalSetting = await portalSettingRepositories.getProtalSettings();
            const portalName = portalSetting.portalName || 'CareerBase';

            if (recruiter) {
                const htmlContent = `
Dear Recruiter,
<br><br>
We would like to inform you that your company <strong>${updatedCompany.name}</strong> has been <strong>deactivated</strong> on <strong>${portalName}</strong>.
<br><br>
This means you will temporarily be unable to post new jobs or manage existing applications.
<br><br>
Please contact our support team for further clarification.
<br><br>
Best regards,<br><strong>${portalName} Team</strong>
`;
                await sendMail({
                    to: recruiter.email,
                    subject: `Testing Node.js Project-Your Company Has Been Deactivated on ${portalName}`,
                    html: htmlContent
                });
            }

            return res.status(200).json({
                status: true,
                message: `${company.name} is deactivated successfully`
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

}

module.exports = new CompanyController();