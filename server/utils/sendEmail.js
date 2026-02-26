const nodemailer = require('nodemailer');

const sendEmail = async (options) =>{
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `Mess Mate <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    console.log('Sending email with options:', mailOptions); // Debug log
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully'); // Debug log
}

module.exports = sendEmail;