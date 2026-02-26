const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
var morgan = require('morgan')

require('dotenv').config(); // Load environment variables from .env file to process.env



// initialize app
const app = express();

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev')); // Log HTTP requests to the console

// test route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Auth routes
app.use('/api/auth', require('./routes/authRoutes'));
// Student routes
app.use('/api/student', require('./routes/studentRoutes'));
// Hostel routes
app.use('/api/hostels', require('./routes/hostelRoutes'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});