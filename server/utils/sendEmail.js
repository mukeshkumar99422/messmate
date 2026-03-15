// const nodemailer = require('nodemailer');

// const sendEmail = async (options) =>{
//     const transporter = nodemailer.createTransport({
//         host: 'smtp.gmail.com',
//         port: 587,
//         secure: false,
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS,
//         },
//     });

//     const mailOptions = {
//         from: `Mess Mate <${process.env.EMAIL_USER}>`,
//         to: options.email,
//         subject: options.subject,
//         text: options.message,
//     };

//     console.log('Sending email...');
//     try {
//         await transporter.sendMail(mailOptions);
//         console.log('Email sent successfully');
//     } catch (error) {
//         console.error('Email sending failed:', error);
//         throw error;
//     }

// }


// const nodemailer = require('nodemailer');
// const { google } = require('googleapis');

// const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
// const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
// const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
// const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

// const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
// oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// const sendEmail = async (options) => {
//     console.log('Preparing to send email via Gmail API (OAuth2)...');
//     try {
//         const { token } = await oAuth2Client.getAccessToken();
//         console.log("Access Token Generated:", token ? "YES" : "NO");

//         const transporter = nodemailer.createTransport({
//             host: 'smtp.gmail.com',
//             port: 465,
//             secure: true,
//             auth: {
//                 type: 'OAuth2',
//                 user: process.env.EMAIL_USER,
//                 clientId: CLIENT_ID,
//                 clientSecret: CLIENT_SECRET,
//                 refreshToken: REFRESH_TOKEN,
//                 accessToken: token,
//             },
//         });

//         const mailOptions = {
//             from: `Mess Mate <${process.env.EMAIL_USER}>`,
//             to: options.email,
//             subject: options.subject,
//             text: options.message,
//         };

//         await transporter.sendMail(mailOptions);
//         console.log('Email sent via Gmail API (OAuth2)');
//     } catch (error) {
//         console.error('Gmail API Error:', error);
//         throw error;
//     }
// };

// const nodemailer = require('nodemailer');

const { google } = require('googleapis');

const sendEmail = async (options) => {
    try {
        const oAuth2Client = new google.auth.OAuth2(
            process.env.GMAIL_CLIENT_ID,
            process.env.GMAIL_CLIENT_SECRET,
            'https://developers.google.com/oauthplayground'
        );
        oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

        // Gmail API requires the email to be base64url encoded
        const subject = options.subject;
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        const messageParts = [
            `From: Mess Mate <${process.env.EMAIL_USER}>`,
            `To: ${options.email}`,
            'Content-Type: text/html; charset=utf-8',
            'MIME-Version: 1.0',
            `Subject: ${utf8Subject}`,
            '',
            options.message,
        ];
        const message = messageParts.join('\n');

        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const result = await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw: encodedMessage },
        });
        console.log('Email sent successfully. Message ID:', result.data.id);
        return result;
    } catch (error) {
        console.error('ERROR:(If you see "invalid_grant", your refresh token has expired or been revoked)', error.message);
        throw error;
    }
    
};

module.exports = sendEmail;