const { Receiver } = require("@upstash/qstash");
const sendEmail = require("../utils/sendEmail");

const {
    acquireJob,
    completeJob,
    releaseJob,
} = require("../utils/emailJobLock");

const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
});

// ==========================================
// Send Email Worker
// ==========================================
const sendEmailJob = async (req, res) => {
    const signature = req.headers["upstash-signature"];
    const jobId = req.headers["upstash-message-id"];
    const body = req.body.toString();

    // handle missing data
    if (!signature) return res.status(401).json({message: "Missing QStash signature"});
    if (!jobId) return res.status(400).json({message: "Missing Upstash Message ID"});

    // Verify signature
    const isValid = await receiver.verify({signature,body}).catch(() => false);
    if (!isValid) return res.status(401).json({message: "Invalid signature"});

    try {

        // Acquire Job
        const status = await acquireJob(jobId);
        if (status === "done") return res.status(200).json({ok: true,skipped: true});
        if (status === "processing") return res.status(200).json({ok: true,skipped: true});

        // Process Job
        const {email,subject,message} = JSON.parse(body);
        await sendEmail({email,subject,message});

        // Success
        await completeJob(jobId);
        return res.status(200).json({ok: true});

    } catch (err) {
        // remove lock
        await releaseJob(jobId);

        // Let QStash retry
        return res.status(500).json({ok: false});
    }
};

module.exports = {
    sendEmailJob,
};