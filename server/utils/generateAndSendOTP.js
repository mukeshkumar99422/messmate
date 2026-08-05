const Otp = require('../models/Otp');
const sendEmail = require('./email/sendEmail');

/**
 * generate a random 6 digit otp and integrate in messageTemplate's OTP blank.
 * @param {*} email 
 * @param {*} subject 
 * @param {*} messageTemplate 
 */
const generateAndSendOTP = async (email, subject, messageTemplate) => {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Remove any existing OTP for this email
    await Otp.deleteMany({ email });
    // Save new OTP
    await Otp.create({ email, otp: otpCode });

    const message = messageTemplate.replace('{{OTP}}', otpCode);
    await sendEmail({ email, subject, message });
};

module.exports = generateAndSendOTP;