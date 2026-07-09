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