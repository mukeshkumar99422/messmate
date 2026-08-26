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
const mongoSanitize = require('@exortek/express-mongo-sanitize');
const { paramSanitizeHandler } = require('@exortek/express-mongo-sanitize');
// const {generateCsrfToken, doubleCsrfProtection, ensureCsrfSid } = require('./middlewares/csrfMiddleware');

// --------------------initialize app-----------------------
const app = express();

// ---------------to get corect ip in request---------------
// ie not of reverse proxy server
app.set('trust proxy', 1); // make one hop

// ------------------Connect to MongoDB---------------------
connectDB();

// -----------------Import redis config for file loging-----
require('./config/redis')

// ----------------------Middlewares------------------------
//Helmet
//secure app by setting various HTTP headers
app.use(helmet())

//Cors
//set up access control headers for cross-origin requests
app.use(cors({
    origin: process.env.CLIENT_URL, // Access-Control-Allow-Origin
    credentials: true, // Access-Control-Allow-Credentials
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Access-Control-Allow-Methods
    allowedHeaders: ["Content-Type", "Authorization" , "x-csrf-token", "Idempotency-Key"], // Access-Control-Allow-Headers
    maxAge: 600 // Access-Control-Max-Age
}));

//req statistics
app.use(morgan('dev'));

//rate limiting: DDOS protection
app.use(globalLimiter);

//json parser
app.use(express.json());

//cookie parser
app.use(cookieParser());

// csrf id ensure in request cookie
// app.use(ensureCsrfSid);

//NoSQL injection atack protection (strips $ and . from req.body/req.qeury)
//NOTE: req.query is read only=> mutate inplace only(handled internally by mongoSanitize())
//NOTE: not applicable for req.params: because handled differently=> use paramSanitizeHandler()
app.use(mongoSanitize());
app.param('id', paramSanitizeHandler());
app.param('hostelId', paramSanitizeHandler());
app.param('day', paramSanitizeHandler());

// ----------------------Routes------------------------------

// test route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// generate csrf token
// app.get('/api/csrf-token', (req, res) => {
//     const csrfToken = generateCsrfToken(req, res);
//     res.json({ csrfToken });
// });

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