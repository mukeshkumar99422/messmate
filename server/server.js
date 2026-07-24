// ----------------Load environment variables---------------
require('dotenv').config();

// ------------------------imports--------------------------
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
var morgan = require('morgan');
const helmet = require('helmet');
const { globalLimiter } = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');

// --------------------initialize app-----------------------
const app = express();

// ---------------to get corect ip in request---------------
// -------------ie not of reverse proxy server--------------
app.set('trust proxy', 1); // make one hop

// ------------------Connect to MongoDB---------------------
connectDB();

// -----------------Import redis config for file loging-----
require('./config/redis')

// ----------------------Middlewares------------------------
//cors
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
//json parser
app.use(express.json());
//cookie parser
app.use(cookieParser());
//req statistics
app.use(morgan('dev'));
//filtering response header
app.use(helmet());
//rate limiting
app.use(globalLimiter);

// ----------------------Routes------------------------------

// test route
app.get('/', (req, res) => {
  res.send('Hello World!');
});


// Auth routes
app.use('/api/auth', require('./routes/authRoutes'));
// Hostel routes
app.use('/api/hostels', require('./routes/hostelRoutes'));
// Student routes
app.use('/api/student', require('./routes/studentRoutes'));
// Accountant routes
app.use('/api/accountant', require('./routes/accountantRoutes'));
// Admin routes
app.use('/api/admin', require('./routes/adminRoutes'));

// not found route
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ---------------error handler -------------------------
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;