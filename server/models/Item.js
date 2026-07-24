const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['diet', 'extra'], required: true },
    price: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

itemSchema.index({ hostel: 1, name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Item', itemSchema);