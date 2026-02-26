const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false //optional for admin, accountant etc.
    },
    identifier: {
        type: String,
        required: true,
        unique: true
    }, // email for students, id for admin, accountant etc.
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'admin', 'accountant'],
        required: true
    },
    hostel: {
        type: String,
        ref: 'Hostel',
        required: function() {
            return this.role!=='admin'; // required for students and accountants, but not for admin
        }
    },
    isVerified: {
        type: Boolean,
        default: function() {return  this.role !== 'student';}
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;