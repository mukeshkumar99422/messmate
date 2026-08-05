const { qstashClient } = require('../../config/qstash');
const sendEmail = require('./sendEmail');

/**
 * queue email to send emails later
 * via post request to /api/jobs/send-email by QStash
 * added dedupeKey to avoid queuing same email multiple times
 * @param {{email: string, subject: string, message: string, dedupeKey: string}} options 
 * @returns 
 */
const queueEmail = async (options) => {
    const {email, subject, message, dedupeKey} = options;

    // QStash not configured -> fall back to direct send
    if (!process.env.QSTASH_TOKEN) {
        return sendEmail(options).catch(err =>
            console.error('[Email] direct send failed:', err.message)
        );
    }

    // queue the email
    return qstashClient.publishJSON({
        url: `${process.env.SERVER_URL}/api/jobs/send-email`,
        body: { email, subject, message },
        retries: 3,
        deduplicationId: dedupeKey
    });
};

module.exports = queueEmail;