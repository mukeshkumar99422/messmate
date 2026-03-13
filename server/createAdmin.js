const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        // Connect to your MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/messmate');
        console.log('Connected to Database');

        // --- YOUR CUSTOM ADMIN CREDENTIALS ---
        const loginId = "admin";
        const myPassword = "admin@9872"; 
        // -------------------------------------

        // Check if admin already exists
        const existingAdmin = await User.findOne({ identifier: loginId });
        if (existingAdmin) {
            console.log("Admin account already exists!");
            process.exit();
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(myPassword, salt);

        // Create the admin
        await User.create({
            name: "Super Admin",
            identifier: loginId,
            password: hashedPassword,
            role: "admin",
            isVerified: true
        });

        console.log("Admin created successfully! You can now log in.");
        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

createAdmin();