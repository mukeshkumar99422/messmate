const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {type: String, required: true},
    otp: {type: String, required: true},
    attempts: { type: Number, default: 0 },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // seconds  // auto-delete after 5 minutes
    }
});
otpSchema.index({ email: 1 });
const Otp = mongoose.model('Otp', otpSchema);
module.exports = Otp;