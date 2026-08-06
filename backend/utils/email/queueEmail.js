// DEDUPLICATION: 
// insert only not processed jobs into queue
// implemented by QStash using deduplicationId in publishJSON

const { qstashClient } = require('../../config/qstash');

/**
 * queue email in QStash to send emails asynchronously
 * via post request to email worker by QStash
 * @param {{email: string, subject: string, message: string, dedupeKey: string}} options 
 * @returns 
 */
const queueEmail = async (options) => {
    const {email, subject, message, dedupeKey} = options;

    // QStash not configured
    if (!process.env.QSTASH_TOKEN) {
        console.error('[Email] QSTASH_TOKEN not configured — email not queued:', dedupeKey);
        return null;
    }

    // queue the email
    return qstashClient.publishJSON({
        url: `${process.env.EMAIL_WORKER_URL}/api/jobs/send-email`,
        body: { email, subject, message },
        retries: 3,
        deduplicationId: dedupeKey
    });
};

module.exports = queueEmail;