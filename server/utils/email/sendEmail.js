const { getAccessToken } = require('./gmailAuth');

/**
 * send email via google email apis - OAuth2
 * @param {Object} options - {email, subject, message}
 * @returns 
 */
const sendEmail = async (options) => {
    try {
        const accessToken = await getAccessToken();

        // MIME-building
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

        const encodedMessage = Buffer.from(message) // encodes message in base64url format
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');


        // Send the email using Gmail API
        const response = await fetch(
            'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ raw: encodedMessage }),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error?.message || 'Gmail API request failed');
        }

        return result;
    } catch (error) {
        throw error;
    }
};

module.exports = sendEmail;