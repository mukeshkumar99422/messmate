const mongoose = require('mongoose');
const chalk = require('chalk');

const connectDB = async () =>{
    try {
        console.log(chalk.blue("Connecting to MongoDB..."));
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(chalk.green("MongoDB Connected: " + conn.connection.host));
    } catch (error) {
        console.error(chalk.red("Error connecting to MongoDB:"), error);
        process.exit(1); // Exit the process with failure
    }
}

module.exports = connectDB;