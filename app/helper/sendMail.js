const transporter=require('../config/emailConfig');

const sendMail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; 
  }
};

module.exports = {
  sendMail
};

