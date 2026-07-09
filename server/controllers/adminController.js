const Hostel = require('../models/Hostel');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail');
const {getISTDateString} = require('../utils/helpers');

// ==========================================
// FETCH ALL HOSTELS (Admin View)
// ==========================================
const getAllHostelsAdmin = async (req, res) => {
    try {
        // 1. Fetch all hostels in one go
        const hostels = await Hostel.find({});

        //2. Fetch ALL accountants in a single batch query
        const hostelIds = hostels.map(h => h._id);
        const accountants = await User.find({ 
            hostel: { $in: hostelIds }, 
            role: 'accountant' 
        }).select('identifier hostel');

        // 3. Create a look-up map for O(1) time complexity indexing in memory
        const accountantMap = {};
        accountants.forEach(acc => {
            if (acc.hostel) {
                accountantMap[acc.hostel.toString()] = acc.identifier;
            }
        });

        // 4. Format the array using the in-memory lookup map
        const formattedHostels = hostels.map((h) => {
            const hostelObjectId = h._id.toString();
            
            return {
                id: h.id, 
                name: h.name,
                residents: h.residents,
                students: h.studentCount,
                accountantContactNo: h.accountantContactNo,
                accountantEmail: h.accountantEmail,
                hostelContactNo: h.hostelContactNo,
                hostelEmail: h.hostelEmail,
                loginId: accountantMap[hostelObjectId] || "Not Assigned"
            };
        });

        res.json(formattedHostels);
    } catch (error) {
        const errorMsg = error.message ? error.message : "Unknown Error";
        res.status(500).json({ message: errorMsg.length > 50 ? "Server Error" : errorMsg });
    }
};

// ==========================================
// 2. ADD NEW HOSTEL & CREATE ACCOUNTANT
// ==========================================
const addHostel = async (req, res) => {
    const { name, residents, accountantContactNo, accountantEmail, hostelContactNo, hostelEmail, loginId, password } = req.body;

    try {
        // 1. Check if loginId, hostel email, hostel name is already taken
        const existingUser = await User.findOne({
            $or: [
                {identifier: loginId},
                {email: hostelEmail}
            ]
        });
        if (existingUser) return res.status(400).json({ message: "Login ID or hostel email is already taken." });

        const existingHostel = await Hostel.findOne({name: name});
        if(existingHostel) return res.status(400).json({message: "Hostel name is already taken."})

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
            name: `${name} Accountant`,
            identifier: loginId,
            email: hostelEmail,
            password: hashedPassword,
            role: 'accountant',
            hostel: newHostel._id,
            isVerified: true
        });

        // 4. email to hostel email: loginid and password
        try {
            const emailSubject = `[MessMate] Accountant Portal Access Credentials - ${name}`;
            const emailMessage = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Setup Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-w: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        
        <!-- Top Institutional Brand Header Bar -->
        <tr>
            <td style="background-color: #16a34a; padding: 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Mess<span style="color: #d1fae5;">Mate</span></h1>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #d1fae5; font-weight: 500;">Campus Dining Management System</p>
            </td>
        </tr>

        <!-- Main Body Content Core -->
        <tr>
            <td style="padding: 40px 30px;">
                <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #1e293b;">Hello <strong>${name} Administration</strong>,</p>
                
                <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #475569;">
                    An administrative accountant portal profile associated with your hostel housing facility has been successfully initialized and configured by the system administrator. 
                </p>

                <!-- Credentials Dashboard Container Block -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                    <tr>
                        <td style="padding-bottom: 10px; font-size: 13px; color: #64748b; font-weight: 700; text-transform: uppercase;">Portal Identity Credentials</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #334155;">
                            <strong style="display: inline-block; width: 100px; color: #475569;">Login ID:</strong> 
                            <code style="font-family: Menlo, Monaco, Consolas, monospace; background-color: #cbd5e1; padding: 3px 6px; border-radius: 4px; color: #0f172a; font-weight: 600;">${loginId}</code>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #334155;">
                            <strong style="display: inline-block; width: 100px; color: #475569;">Password:</strong> 
                            <code style="font-family: Menlo, Monaco, Consolas, monospace; background-color: #cbd5e1; padding: 3px 6px; border-radius: 4px; color: #0f172a; font-weight: 600;">${password}</code>
                        </td>
                    </tr>
                </table>

                <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 20px; color: #94a3b8; font-style: italic;">
                    🔒 Security Notice: To preserve database integrity, avoid distributing these system credentials across unencrypted notification channels. Please update your profile password immediately upon your first administrative login.
                </p>

                <p style="margin: 32px 0 0 0; font-size: 14px; color: #475569; line-height: 20px;">
                    Best Regards,<br>
                    <strong style="color: #0f172a;">Mess Mate Team</strong><br>
                    <span style="font-size: 12px; color: #64748b;">National Institute of Technology, Kurukshetra</span>
                </p>
            </td>
        </tr>

        <!-- Standard Compliant Transactional Footer -->
        <tr>
            <td style="background-color: #f8fafc; padding: 20px 30px; border-t: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; line-height: 16px;">
                This message contains automated administrative setup notifications for internal operations. If you received this notification in error, please contact your university IT support network.
                <br><br>
                © ${new Date(getISTDateString()).getFullYear()} MessMate System. All rights reserved.
            </td>
        </tr>
    </table>
</body>
</html>
`;

            await sendEmail({
                email: hostelEmail,
                subject: emailSubject,
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
            students: 0
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
        // 1. Check if the targeted hostel exists
        const existingHostel = id ? await Hostel.findOne({ id: Number(id) }) : null;
        if (!existingHostel) {
            return res.status(404).json({ message: `Hostel with id: ${id} does not exist.` });
        }
        // 1.2 check if name already taken
        if(name!=existingHostel.name) {
            const hostelWithSameName = await Hostel.findOne({name: name});
            if(hostelWithSameName) return res.status(400).json({message: "Hostel name is already taken."})
        }

        // 2. Find and update the Accountant
        const accountant = await User.findOne({ hostel: existingHostel._id, role: 'accountant' });
        
        // 2.1 Check if the new loginId or email is already taken by someone else
        const userExists = await User.findOne({
            _id: { $ne: accountant._id },
            $or: [
                {identifier: loginId},
                {email: hostelEmail}
            ]
        });
        if (userExists) return res.status(400).json({ message: "Login ID or hostel email is already taken." });

        accountant.identifier = loginId;
        accountant.email = hostelEmail;

        // 2.2 Only update the password if the admin typed a new one
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            accountant.password = await bcrypt.hash(password, salt);
        }
        await accountant.save();

        // 3. Complete Step 3: Update Hostel Document in Memory and Save Natively
        existingHostel.name = name;
        existingHostel.residents = residents;
        existingHostel.accountantContactNo = accountantContactNo || '';
        existingHostel.accountantEmail = accountantEmail || '';
        existingHostel.hostelContactNo = hostelContactNo || '';
        existingHostel.hostelEmail = hostelEmail;

        await existingHostel.save();

        // 4. Email notification to hostel administration
        try {
            const displayPassword = password && password.trim() !== "" ? password : "(Unchanged)";

            const updateSubject = `[MessMate] Account Profile Updated - ${name}`;
            const updateMessage = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Profile Update Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-w: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        
        <!-- Top Institutional Brand Header Bar -->
        <tr>
            <td style="background-color: #16a34a; padding: 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Mess<span style="color: #d1fae5;">Mate</span></h1>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #d1fae5; font-weight: 500;">Campus Dining Management System</p>
            </td>
        </tr>

        <!-- Main Body Content Core -->
        <tr>
            <td style="padding: 40px 30px;">
                <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #1e293b;">Hello <strong>${name} Administration</strong>,</p>
                
                <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #475569;">
                    This notification confirms that your hostel's accountant portal details have been updated by the system administrator. Your active operational credentials have been synchronized across our secure servers.
                </p>

                <!-- Credentials Dashboard Container Block -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                    <tr>
                        <td style="padding-bottom: 10px; font-size: 13px; color: #64748b; font-weight: 700; text-transform: uppercase;">Synchronized Profile Details</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #334155;">
                            <strong style="display: inline-block; width: 100px; color: #475569;">Login ID:</strong> 
                            <code style="font-family: Menlo, Monaco, Consolas, monospace; background-color: #cbd5e1; padding: 3px 6px; border-radius: 4px; color: #0f172a; font-weight: 600;">${loginId}</code>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #334155;">
                            <strong style="display: inline-block; width: 100px; color: #475569;">Password:</strong> 
                            <code style="font-family: Menlo, Monaco, Consolas, monospace; background-color: #cbd5e1; padding: 3px 6px; border-radius: 4px; color: #0f172a; font-weight: 600;">${displayPassword}</code>
                        </td>
                    </tr>
                </table>

                <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 20px; color: #94a3b8; font-style: italic;">
                    🔒 Security Reminder: If the access password displays as "(Unchanged)", your previous configuration boundaries remain active. Please do not reply directly to this automated administrative thread.
                </p>

                <p style="margin: 32px 0 0 0; font-size: 14px; color: #475569; line-height: 20px;">
                    Best Regards,<br>
                    <strong style="color: #0f172a;">Mess Mate Team</strong><br>
                    <span style="font-size: 12px; color: #64748b;">National Institute of Technology, Kurukshetra</span>
                </p>
            </td>
        </tr>

        <!-- Standard Compliant Transactional Footer -->
        <tr>
            <td style="background-color: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; line-height: 16px;">
                This message contains automated administrative setup notifications for internal operations. If you received this notification in error, please contact your university IT support network.
                <br><br>
                © ${new Date(getISTDateString()).getFullYear()} MessMate System. All rights reserved.
            </td>
        </tr>
    </table>
</body>
</html>
`;
            await sendEmail({
                email: hostelEmail,
                subject: updateSubject,
                message: updateMessage
            });
        } catch (emailError) {
            console.error("Failed to send update confirmation email:", emailError.message);
        }

        res.json({ message: "Hostel and Accountant updated successfully" });
    } catch (error) {
        // Safe string error logging frame preventing runtime exceptions
        const errorMsg = error.message ? error.message : "Unknown Server Error";
        res.status(500).json({ message: errorMsg.length > 50 ? "Server Error" : errorMsg });
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
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 5. REMOVE STUDENT ACCOUNTS
// ==========================================
const removeAccounts = async (req, res) => {
    const { studentIdentifiers } = req.body; // Array of emails
    const { hostelId } = req.params;

    try {
        // 1. find hostel to get _id
        const hostel = await Hostel.findOne({ id: Number(hostelId) });
        if(!hostel) return res.status(404).json({ message: "Hostel not found" });

        // 2. Delete the students and capture exactly how many were actually deleted
        const deleteResult = await User.deleteMany({ 
            identifier: { $in: studentIdentifiers }, 
            role: 'student' 
        });

        // 3. Subtract the exact deleted count from that specific hostel
        await Hostel.findByIdAndUpdate(hostel._id, { 
            $inc: { studentCount: -deleteResult.deletedCount } 
        });

        res.json({ message: `${deleteResult.deletedCount} accounts removed successfully.` });
    } catch (error) {
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

module.exports = {
    getAllHostelsAdmin,
    addHostel,
    updateHostelDetails,
    fetchStudentsByHostel,
    removeAccounts
};