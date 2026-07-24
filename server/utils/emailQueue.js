// const sendEmail = require('./sendEmail');

// class EmailQueue {
//     constructor() {
//         this.queue = [];
//         this.isProcessing = false;
//     }

//     /**
//      * Pushes a new email job into the queue and starts the worker if it is asleep.
//      */
//     add(emailData, retries = 3) {
//         this.queue.push({ ...emailData, retries });
//         console.log(`[Email Queue] Job added. Pending emails: ${this.queue.length}`);
        
//         if (!this.isProcessing) {
//             this.process().catch(err => console.error("[Email Queue] Critical error:", err));
//         }
//     }

//     /**
//      * Background worker that processes jobs sequentially.
//      */
//     async process() {
//         this.isProcessing = true;

//         // Loop until the array is empty
//         while (this.queue.length > 0) {
//             // Remove the oldest job from the front of the array
//             const job = this.queue.shift();

//             try {
//                 await sendEmail(job);
//                 console.log(`[Email Queue] ✅ Sent to ${job.email}`);
//             } catch (error) {
//                 console.error(`[Email Queue] ❌ Error sending to ${job.email}:`, error.message);
                
//                 // Retry logic: Push back to the end of the line
//                 if (job.retries > 0) {
//                     job.retries -= 1;
//                     this.queue.push(job);
//                     console.log(`[Email Queue] Re-queued. Retries left: ${job.retries}`);
//                 } else {
//                     console.error(`[Email Queue] ⚠️ Job permanently failed for ${job.email}`);
//                 }
//             }

//             // Anti-Spam Buffer: 1-second delay between emails protects your Gmail rate limits
//             await new Promise((resolve) => setTimeout(resolve, 1000));
//         }

//         // Put the worker back to sleep once empty
//         this.isProcessing = false;
//         console.log(`[Email Queue] Queue empty. Worker sleeping.`);
//     }
// }

// // Export a single, global instance so the queue array is shared across the entire app
// module.exports = new EmailQueue();
