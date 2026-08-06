const express = require('express');
const router = express.Router();
const { sendEmailJob } = require('../controllers/jobController');

router.post('/send-email', express.raw({ type: '*/*' }), sendEmailJob);

module.exports = router;