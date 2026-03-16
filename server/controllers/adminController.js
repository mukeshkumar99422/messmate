const Hostel = require('../models/Hostel');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail');

// ==========================================
// 1. FETCH ALL HOSTELS (Admin View)
// ==========================================
const getAllHostelsAdmin = async (req, res) => {
    try {
        const hostels = await Hostel.find({});
        
        // We use Promise.all because we need to query the User collection 
        // for EVERY hostel to find the student count and the accountant details.
        const formattedHostels = await Promise.all(hostels.map(async (h) => {
            const accountant = await User.findOne({ hostel: h._id, role: 'accountant' });
            
            return {
                id: h.id, // Map MongoDB _id to frontend 'id'
                name: h.name,
                residents: h.residents,
                students: h.studentCount,
                accountantContactNo: h.accountantContactNo,
                accountantEmail: h.accountantEmail,
                hostelContactNo: h.hostelContactNo,
                hostelEmail: h.hostelEmail,
                loginId: accountant ? accountant.identifier : "Not Assigned"
            };
        }));

        res.json(formattedHostels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 2. ADD NEW HOSTEL & CREATE ACCOUNTANT
// ==========================================
const addHostel = async (req, res) => {
    const { name, residents, accountantContactNo, accountantEmail, hostelContactNo, hostelEmail, loginId, password } = req.body;

    try {
        // 1. Check if loginId is already taken
        const existingUser = await User.findOne({ identifier: loginId });
        if (existingUser) return res.status(400).json({ message: "Login ID is already taken by another user." });

        // 2. Create the new Hostel
        const lastHostel = await Hostel.findOne().sort({ id: -1 }); 
        const nextId = lastHostel && lastHostel.id ? lastHostel.id + 1 : 1; 

        const newHostel = await Hostel.create({
            id: nextId, 
            name, residents, accountantContactNo, accountantEmail, hostelContactNo, hostelEmail
        });

        // 3. Create the Accountant User for this Hostel
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            name: `${name} Accountant`, // Default name
            identifier: loginId,
            password: hashedPassword,
            role: 'accountant',
            hostel: newHostel._id,
            isVerified: true // Accountants are pre-verified by the admin
        });

        // 4. email to hostel email: loginid and password
        try {
            const emailMessage = `
Hello ${name} Administration,

Your hostel's accountant account has been successfully created on Mess Mate.
Please use the following credentials to access the accountant dashboard:

Login ID: ${loginId}
Password: ${password}

For security reasons, please do not share these credentials with unauthorized personnel.

Regards,
Mess Mate Admin
            `;

            await sendEmail({
                email: hostelEmail,
                subject: 'Mess Mate - Accountant Account Created',
                message: emailMessage
            });
        } catch (emailError) {
            console.error("Failed to send creation email:", emailError);
        }

        // 5. Return the new formatted object back to the frontend
        res.status(201).json({
            id: newHostel.id,
            name, residents, accountantContactNo, accountantEmail, hostelContactNo, hostelEmail,
            loginId,
            students: 0 // A brand new hostel has 0 students!
        });

    } catch (error) {
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 3. UPDATE HOSTEL DETAILS & ACCOUNTANT CREDENTIALS
// ==========================================
const updateHostelDetails = async (req, res) => {
    const { id } = req.params;
    const { name, residents, accountantContactNo, accountantEmail, hostelContactNo, hostelEmail, loginId, password } = req.body;

    try {
        // 1. Update Hostel Document
        const updatedHostel = await Hostel.findOneAndUpdate(
            { id: Number(id) }, 
            { name, residents, accountantContactNo, accountantEmail, hostelContactNo, hostelEmail },
            { new: true }
        );

        // 2. Find and update the Accountant Document
        const accountant = await User.findOne({ hostel: updatedHostel._id, role: 'accountant' });
        
        if (accountant) {
            // Check if the new loginId is already taken by someone else
            if (loginId !== accountant.identifier) {
                const userExists = await User.findOne({ identifier: loginId });
                if (userExists) return res.status(400).json({ message: "Login ID is already taken." });
                accountant.identifier = loginId;
            }

            // Only update the password if the admin typed a new one
            if (password && password.trim() !== "") {
                const salt = await bcrypt.genSalt(10);
                accountant.password = await bcrypt.hash(password, salt);
            }

            await accountant.save();
        }

        //3. email to hostel with new data
        try {
            const displayPassword = password && password.trim()!== "" ? password : "(Unchanged)";
            const updateMessage = `
Hello ${name} Administration,

Your hostel's accountant account details have been updated by the Admin on Mess Mate.
Here are your current login credentials:

Login ID: ${loginId}
Password: ${displayPassword}

Regards,
Mess Mate Admin
            `;
            await sendEmail({
                email: hostelEmail,
                subject: 'Mess Mate - Accountant Account Updated',
                message: updateMessage
            });
        } catch (error) {
            console.error("Failed to send update email:", error);
        }

        res.json({ message: "Hostel and Accountant updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 4. FETCH STUDENTS BY HOSTEL
// ==========================================
const fetchStudentsByHostel = async (req, res) => {
    const { hostelId } = req.params;
    try {
        // First, find the hostel to get _id
        const hostel = await Hostel.findOne({ id: Number(hostelId) });
        if(!hostel) return res.status(404).json({ message: "Hostel not found" });

        // Fetch students and only return their name and identifier (email)
        const students = await User.find({ hostel: hostel._id, role: 'student' }).select('name identifier -_id');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message.tostring().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 5. REMOVE STUDENT ACCOUNTS
// ==========================================
const removeAccounts = async (req, res) => {
    const { studentIdentifiers } = req.body; // Array of emails

    try {
        // 1. Find ONE student to get the hostel ID (assuming all belong to the same hostel)
        const sampleStudent = await User.findOne({ 
            identifier: { $in: studentIdentifiers }, 
            role: 'student' 
        });

        if (!sampleStudent) {
            return res.status(404).json({ message: "No students found to remove." });
        }

        // 2. Delete the students and capture exactly how many were actually deleted
        const deleteResult = await User.deleteMany({ 
            identifier: { $in: studentIdentifiers }, 
            role: 'student' 
        });

        // 3. Subtract the exact deleted count from that specific hostel
        await Hostel.findByIdAndUpdate(sampleStudent.hostel, { 
            $inc: { studentCount: -deleteResult.deletedCount } 
        });

        res.json({ message: `${deleteResult.deletedCount} accounts removed successfully.` });
    } catch (error) {
        res.status(500).json({ message: error.message.tostring().length > 50 ? "Server Error" : error.message });
    }
};

module.exports = {
    getAllHostelsAdmin,
    addHostel,
    updateHostelDetails,
    fetchStudentsByHostel,
    removeAccounts
};