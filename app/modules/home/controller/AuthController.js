const Joi = require('joi');
const authRepositories = require('../repositories/authRepositories');
const { recruiterRegisterSchema } = require('../../recruiter/validation/recruiterRegisterValidation');
const { comparePassword } = require('../../../helper/password');
const jwt = require('jsonwebtoken');
const transporter = require('../../../config/emailConfig');
const { sendMail } = require('../../../helper/sendMail');
const companyRepositories = require('../../company/repositories/companyRepositories');
const portalSettingRepositories = require('../../portal_setting/repositories/portalSettingRepositories');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class AuthController {
    async getRecruiterRegisterPage(req, res) {
        try {
            return res.render('auth/register-recruiter');
        } catch (error) {
            console.log(error);
        }
    }

    async registerRecruiter(req, res) {
        try {

            const { error, value } = recruiterRegisterSchema.validate(req.body, { abortEarly: false });
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

            const { name, email, designation, company, password, isNewCompany, companyId, website } = value;

            const isValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@!#%&*-]{6,}$/.test(password);

            if (!isValid) {
                return res.status(400).json({
                    status: false,
                    errors: {
                        password: 'password must be alphanumeric and at least 6 characters long'
                    }
                });
            }

            const existingUser = await authRepositories.findUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    status: false,
                    errors: { email: 'Email is already registered.' }
                });
            }

            if (isNewCompany) {
                const existingCompanyByName = await companyRepositories.checkCompanyExistByName(company)
                if (existingCompanyByName) {
                    return res.status(400).json({
                        status: false,
                        errors: { company: 'A company with this name already exists. Please select it from the suggestions or use a different name.' }
                    });
                }
            } else {
                const existCompany = await companyRepositories.getCompanyById(companyId);
                if (!existCompany) {
                    return res.status(404).json({
                        status: false,
                        message: 'The selected company is not found. Check again or contact support for query.'
                    })
                }
                if (!existCompany.isActive) {
                    return res.status(400).json({
                        status: false,
                        message: 'The company is not yet approved or has been deactivated. Contact support for query.'
                    })
                }

            }

            const user = await authRepositories.createRecruiter({
                name,
                email,
                password,
                designation,
                company,
                isNewCompany,
                companyId,
                website
            });

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '2d' });

            const url = `${req.protocol}://${req.get('host')}` + `/auth/verify-email/${token}`

            // console.log(url);
            const portalSetting = await portalSettingRepositories.getProtalSettings();
            const portalName = portalSetting.portalName || 'CareerBase';

            const htmlContent = `
           <div style="font-family: Arial, sans-serif; color: #333;">
  <p>Hi,</p>
  <p>Please verify your email to complete your registration on <strong>CareerBase</strong>.</p>

  <p>
    <a href="${url}" style="
      display: inline-block;
      padding: 10px 20px;
      background-color: #007bff;
      color: #fff;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
    ">
      Verify Email
    </a>
  </p>

  <p>Regards,<br>${portalName} Team</p>
</div>
           `

            await sendMail({
                to: user.email,
                subject: `Testing Node.js Project-Verify Your Email`,
                html: htmlContent
            });

            return res.status(201).json({
                status: true,
                message: 'Recruiter registered successfully.Please verify your email and login.',
                url
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getCandidateRegisterPage(req, res) {
        try {
            return res.render('auth/register-candidate');
        } catch (error) {
            console.log(error);

        }
    }

    async registerCandidate(req, res) {
        try {
            const candidateRegisterSchema = Joi.object({
                name: Joi.string().trim().required().messages({
                    'any.required': 'Name is required',
                    'string.empty': 'Name is required',
                }),
                email: Joi.string().email().required().messages({
                    'any.required': 'Email is required',
                    'string.empty': 'Email is required',
                    'string.email': 'Invalid email format',
                }),
                password: Joi.string().min(6).required().messages({
                    'any.required': 'Password is required',
                    'string.empty': 'Password is required',
                    'string.min': 'Password must be at least 6 characters',
                }),
            });

            const { error, value } = candidateRegisterSchema.validate(req.body, { abortEarly: false });
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

            const { name, email, password } = value;

            const isValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@!#%&*-]{6,}$/.test(password);

            if (!isValid) {
                return res.status(400).json({
                    status: false,
                    errors: {
                        password: 'password must be alphanumeric and at least 6 characters long'
                    }
                });
            }

            const existingUser = await authRepositories.findUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    status: false,
                    errors: { email: 'Email is already registered.' }
                });
            }

            const user = await authRepositories.createCandidate(value);

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '2d' });

            const url = `${req.protocol}://${req.get('host')}` + `/auth/verify-email/${token}`

            // console.log(url);

            const portalSetting = await portalSettingRepositories.getProtalSettings();
            const portalName = portalSetting.portalName || 'CareerBase';

            const htmlContent = `
           <div style="font-family: Arial, sans-serif; color: #333;">
  <p>Hi,</p>
  <p>Please verify your email to complete your registration on <strong>CareerBase</strong>.</p>

  <p>
    <a href="${url}" style="
      display: inline-block;
      padding: 10px 20px;
      background-color: #007bff;
      color: #fff;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
    ">
      Verify Email
    </a>
  </p>

  <p>Regards,<br>${portalName} Team</p>
</div>
           `

            await sendMail({
                to: user.email,
                subject: `Testing Node.js Project-Verify Your Email`,
                html: htmlContent
            });

            return res.status(201).json({
                status: true,
                message: 'Registered successfully.Please verify your email and login.',
                url
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }


    async getLoginPage(req, res) {
        try {
            return res.render('auth/login');
        } catch (error) {
            console.log(error);
        }
    }

    
    async loginCandidate(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    status: false,
                    message: 'Email and password are required.'
                });
            }
            const user = await authRepositories.findCandidateOrAdminByEmail(email);
            if (!user) {
                return res.status(400).json({
                    status: false,
                    message: 'Invalid email or password.'
                })
            }
            if (!user.isVerified) {
                return res.status(400).json({
                    status: false,
                    message: 'Please verify your email.'
                })
            }

            const isMatch = await comparePassword(password, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    status: false,
                    message: 'Invalid email or password.'
                })
            }

            if (!user.isActive || user.isRemoved) {
                return res.status(400).json({
                    status: false,
                    message: 'Your account is not active.Please contact support for query.'
                })
            }


            const payload = {
                _id: user._id,
                username: user.name,
                role: user.role,
                profilePicture: user.profilePicture
            }

            let token_name = 'candidate_token';

            if (user.role === 'admin') {
                token_name = 'admin_token'
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });
            res.cookie(token_name, token, { httpOnly: true, maxAge: 3600000 * 3 });

            res.status(200).json({
                status: true,
                message: 'Logged in successfully.',
                role: user.role
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async loginRecruiter(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    status: false,
                    message: 'Email and password are required.'
                });
            }
            const user = await authRepositories.findRecruiterByEmail(email);
            if (!user) {
                return res.status(400).json({
                    status: false,
                    message: 'Invalid email or password.'
                })
            }
            if (!user.isVerified) {
                return res.status(400).json({
                    status: false,
                    message: 'Please verify your email.'
                })
            }



            const isMatch = await comparePassword(password, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    status: false,
                    message: 'Invalid email or password.'
                })
            }

            if (user.recruiterProfile.approvalStatus === 'pending') {
                return res.status(400).json({
                    status: false,
                    message: 'Your company has not approved your recruiter profile.'
                })
            }

            const companyData = await companyRepositories.getCompanyById(user.company);
            if (!companyData.isActive && !user.recruiterProfile.isActive) {
                return res.status(400).json({
                    status: false,
                    message: 'Your company has been deativated from Job Platform. Please contact support for query.'
                })
            }

            if (!user.recruiterProfile.isActive) {
                return res.status(400).json({
                    status: false,
                    message: 'Your recruiter profile has been deactivated'
                })
            }

            const payload = {
                _id: user._id,
                username: user.name,
                role: user.role,
                profilePicture: user.profilePicture,
                companyId: user.company,
                recruiterRole: user.recruiterProfile?.companyRole || 'basic_recruiter'
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });
            res.cookie('recruiter_token', token, { httpOnly: true, maxAge: 3600000 * 3 });

            res.status(200).json({
                status: true,
                message: 'Logged in successfully.',
                role: user.role
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async verifyEmail(req, res) {
        try {
            const token = req.params.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await authRepositories.getUserById(decoded.userId);

            if (!user) {
                return res.redirect('/auth/message?status=error&message=Invalid or expired token.');
            }

            if (user.isVerified) {
                return res.redirect('/auth/message?status=info&message=Your email is already verified.');
            }

            await authRepositories.emailverifyUser(decoded.userId);

            return res.redirect('/auth/message?status=success&message=Your email has been verified successfully.');
        } catch (error) {
            console.error(error);

            if (error.name === 'TokenExpiredError') {
                const decoded = jwt.decode(req.params.token);
                if (decoded && decoded.userId) {
                    const user = await authRepositories.getUserById(decoded.userId);
                    if (user && !user.isVerified) {
                        const newToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '2d' });
                        const url = `${req.protocol}://${req.get('host')}/auth/verify-email/${newToken}`;

                        console.log(url);

                        const portalSetting = await portalSettingRepositories.getProtalSettings();
                        const portalName = portalSetting.portalName || 'CareerBase';
                        const htmlContent = `
                        <div style="font-family: Arial, sans-serif; color: #333;">
                        <p>Your previous verification link expired.</p>
                              <p>
                                <a href="${url}" style="display:inline-block;padding:10px 20px;background-color:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
                                  Verify Email
                                </a>
                                </p>
                                 <p>Regards,<br>${portalName} Team</p>

                                </div>
                        `

                        await sendMail({
                            to: user.email,
                            subject: `Testing Node.js Project - Resend Link to Verify Your Email`,
                            html: htmlContent
                        });

                        return res.redirect('/auth/message?status=info&message=Verification link expired. A new one has been sent to your email.');
                    }
                }
            }

            return res.redirect('/auth/message?status=error&message=Something went wrong during email verification.');
        }
    }

    async authMessagePage(req, res) {
        try {
            const { status, message } = req.query;
            res.render('auth/auth-message', { status, message })
        } catch (error) {
            console.log(error);
        }
    }

    async updatePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    status: false,
                    message: 'Both current and new password are required'
                });
            }


            const isValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@!#%&*-]{6,}$/.test(newPassword);
            if (!isValid) {
                return res.status(400).json({
                    status: false,
                    message: 'New password must be alphanumeric and at least 6 characters long'
                });
            }

            const userId = req.user._id;
            const user = await authRepositories.getUserById(userId);

            if (!user) {
                return res.status(400).json({
                    status: false,
                    message: 'User is not found.'
                });
            }

            const isMatch = await comparePassword(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    status: false,
                    message: 'Incorrect current password.'
                })
            }

            const updatePassword = await authRepositories.updatePassword(userId, newPassword);

            return res.status(200).json({
                status: true,
                message: 'Password updated successfully'
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getForgotPasswordPage(req, res) {
        try {
            return res.render('auth/forgot-password', { title: 'Forget Password' })
        } catch (error) {
            console.log(error);
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({
                    status: false,
                    message: 'Email is required.'
                });
            }

            const user = await authRepositories.findUserByEmail(email);
            if (!user) {
                return res.status(404).json({
                    status: false,
                    message: 'User is not found.'
                })
            }

            const otp = crypto.randomInt(100000, 999999).toString();
            await authRepositories.deleteOpt(user._id);

            const newOtp = await authRepositories.addFotgerPasswordOtp({
                userId: user._id,
                otp,
                email: user.email
            })

            const portalSetting = await portalSettingRepositories.getProtalSettings();
            const portalName = portalSetting.portalName || 'CareerBase';

            const htmlContent = `
          <p>Hello ${user.name || 'User'},</p>
                <p>You recently requested to reset your password for your account.</p>
                <p>Your One-Time Password (OTP) for password reset is: <strong>${otp}</strong></p>
                <p>This OTP is valid for 5 minutes. Do not share this OTP with anyone.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
                <br>
                <p>Regards,</p>
                <p>${portalName} Team</p>
           `;

            await sendMail({
                to: user.email,
                subject: `Testing Node.js Project- Password Reset OTP for Your Account`,
                html: htmlContent
            });
            // console.log(otp);
            return res.status(200).json({
                status: true,
                message: 'OTP has been sent to user email, valid for 5 minutes.',
            });


        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async verifyOtpAndPassword(req, res) {
        try {
            const { email, otp, newPassword } = req.body;

            if (!email || !otp || !newPassword) {
                return res.status(400).json({
                    status: false,
                    message: 'Email, OTP, and new password are required.'
                });
            }

            const isValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@!#%&*-]{6,}$/.test(newPassword);
            if (!isValid) {
                return res.status(400).json({
                    status: false,
                    message: 'New password must be alphanumeric and at least 6 characters long'
                });
            }

            const user = await authRepositories.findUserByEmail(email);
            if (!user) {
                return res.status(400).json({
                    status: false,
                    message: 'User is not found'
                });
            }

            const storedOtp = await authRepositories.findOtp(user._id, user.email);
            if (!storedOtp) {
                return res.status(400).json({
                    status: false,
                    message: 'OTP is invalid or has expired. Please request a new one.'
                });
            }

            const isOtpValid = await bcrypt.compare(otp, storedOtp.otp);
            if (!isOtpValid) {
                await authRepositories.deleteOtp(storedOtp._id);
                return res.status(400).json({
                    status: false,
                    message: 'Invalid OTP. Please try again or request a new one.'
                });
            }

            const updatedPassword = await authRepositories.updatePassword(user._id, newPassword);

            await authRepositories.deleteOtp(storedOtp._id);

            return res.status(200).json({
                status: true,
                message: 'Password reset successfully!',
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async adminLogout(req, res) {
        try {
            res.clearCookie('admin_token');
            return res.redirect('/auth/login');
        } catch (error) {
            console.log(error);
        }
    }

    async candidateLogout(req, res) {
        try {
            res.clearCookie('candidate_token');
            return res.redirect('/auth/login');
        } catch (error) {
            console.log(error);
        }
    }
    async recruiterLogout(req, res) {
        try {
            res.clearCookie('recruiter_token');
            return res.redirect('/auth/login');
        } catch (error) {
            console.log(error);
        }
    }

}

module.exports = new AuthController();