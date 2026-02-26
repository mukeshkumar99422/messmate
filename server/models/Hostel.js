const mongoose = require('mongoose');

const HostelSchema = new mongoose.Schema({
    _id: { 
        type: String
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    residents: {
        type: String,
        enum: ['boys', 'girls'],
        required: true
    },
    studentCount: {
        type: Number,
        default: 0
    },
    accountantContactNo: {
        type: String,
        default: ''
    },
    accountantEmail: {
        type: String,
        default: ''
    },
    hostelContactNo: {
        type: String,
        default: ''
    },
    hostelEmail: {
        type: String,
        required: true
    },

    accountant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true });

const Hostel = mongoose.model('Hostel', HostelSchema);
module.exports = Hostel;