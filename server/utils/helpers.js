const Item = require('../models/Item');
const Otp = require('../models/Otp');

//-----------------------------------------------------
// VALIDATE HELPERS
//-----------------------------------------------------
/**
 * check whether an email is valid or not
 * @param {String} email 
 * @returns {boolean}
 */
const validateNormalEmail = (email) => {
     if (!email || email.length > 254) return false;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})*$/;
    return emailRegex.test(email);
}

/**
 * check whether an email is valid 'nitkkr.ac.in' domain email id or not
 * @param {string} email 
 * @returns {boolean}
 */
const validateNITKKREmail = (email) => {
    const nitkDomain = '@nitkkr.ac.in';
    return validateNormalEmail(email) && email.endsWith(nitkDomain);
}

/**
 * check whether a contact number is valid or not
 * length = 10
 * @param {string} contactNumber 
 * @returns {boolean}
 */
const validateContactNumber = (contactNumber) => {
    if (!contactNumber) return false;

    const trimmedNumber = String(contactNumber).trim();
    if (trimmedNumber.length !== 10) return false;

    const contactNumberRegex = /^[6-9]\d{9}$/;
    return contactNumberRegex.test(trimmedNumber);
}

/**
 * check whether a login id is valid or not
 * @param {string} identifier 
 * @returns {boolean}
 */
const validateIdentifier = (identifier) => {
    if(!identifier || identifier.length>30 || identifier.length<3) return false;
    return true;
}

/**
 * check whether a password fulfill certain criteria
 * 1. length > 5 : length not much short
 * 2. length < 73 : bycript compatible
 * 3. must contain atleast one lowercase, uppercase, number, special character
 * @param {string} password 
 * @returns {boolean}
 */
const validatePassword = (password) => {
    if (!password || password.length < 6 || password.length > 72) {
        return false;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()+-]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

/**
 * check whether otp is of length 6
 * and have only digits
 * @param {otp} otp 
 * @returns {boolean}
 */
const validateOtp = (otp) => {
    if(!otp || otp.length!=6) return false;
    const otpRegex = /^\d+$/;

    return otpRegex.test(otp);
}

/**
 * 1. check whether a date string is in the format: YYYY-MM-DD
 * 2. is it a valid date
 * @param {string} dateString 
 * @returns {boolean}
 */
const validateDate = (dateString) =>{
    // Regex pattern for YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    if (!dateString || !dateRegex.test(dateString)) return false;

    //is it an actual date
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) return false;

    return true;
}

//-----------------------------------------------------
// DATE HELPERS
//-----------------------------------------------------
/**
 * Returns the current date as a string in "YYYY-MM-DD" format for Asia/Kolkata timezone.
 * This is useful when the server environment uses UTC internally.
 * @returns {string}
 */
const getISTDateString = () => {
    const date = new Date();
    return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

/**
 * Returns the day of the week for a given date string.
 * If no date is provided, it uses the current IST date.
 * @param {string} [dateString]
 * @returns {string}
 */
const getDayOfWeek = (dateString) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const date = dateString ? new Date(dateString) : getISTDateString();
    return days[date.getDay()];
};

//-----------------------------------------------------
// CONTROLLER HELPERS
//-----------------------------------------------------
/**
 * Converts frontend item strings into their corresponding database item IDs.
 * Creates or updates the items in the database and returns their ObjectIds.
 * @param {Array<{ name: string, price?: number }>} items
 * @param {string} type
 * @param {string} hostelId
 * @returns {Promise<Array>} 
 */
const getIdsFromItems = async (items, type, hostelId) => {
    if (!items || items.length === 0) return [];

    // 1. Prepare bulk upsert operations
    const bulkOps = items.map(item => {
        const cleanName = item.name.trim().toLowerCase();
        return {
            updateOne: {
                filter: { hostel: hostelId, name: cleanName, type: type },
                update: { $set: { price: item.price || 0, isActive: true } },
                upsert: true
            }
        };
    });

    // 2. Execute all upserts in a single database round-trip
    await Item.bulkWrite(bulkOps);

    // 3. Fetch the resulting ObjectIds in one query
    const itemNames = items.map(i => i.name.trim().toLowerCase());
    const dbItems = await Item.find({ 
        hostel: hostelId, 
        name: { $in: itemNames }, 
        type: type 
    }, '_id');

    return dbItems.map(item => item._id);
};

/**
 * Maximum number of OTP verification attempts allowed before the OTP record is reset.
 */
const MAX_OTP_ATTEMPTS = 5;

/**
 * Verifies an OTP for the provided email safely and tracks failed attempts.
 * @param {string} email
 * @param {string} submittedOtp
 * @returns {Promise<{ valid: boolean, reason?: string }>}
 */
const verifyOtpSafely = async (email, submittedOtp) => {
    const record = await Otp.findOne({ email });
    if (!record) return { valid: false, reason: 'expired' };

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
        await Otp.deleteMany({ email }); // force user to request a fresh OTP
        return { valid: false, reason: 'too_many_attempts' };
    }

    if (record.otp !== submittedOtp) {
        await Otp.updateOne({ email }, { $inc: { attempts: 1 } });
        return { valid: false, reason: 'invalid' };
    }

    return { valid: true };
};

/**
 * standard timings of purchase start
 */
const MEAL_START_TIME = {
  breakfast: "07:00",
  lunch: "12:00",
  dinner: "19:00",
};

/**
 * Evaluates whether a student can log an extra purchase for a target meal relative to serving timelines.
 * @param {string} selectedDate - Operational purchase tracking target day ("YYYY-MM-DD").
 * @param {string} meal - Targeted meal token reference.
 * @returns {boolean} True if current time has passed the serving start threshold line, false otherwise.
 */
const canPurchaseMeal = (selectedDate, meal) => {
  const now = new Date();
  const [h, m] = MEAL_START_TIME[meal].split(":").map(Number);
  const mealDateTime = new Date(selectedDate);
  mealDateTime.setHours(h, m, 0, 0);
  return now >= mealDateTime;
};


//-----------------------------------------------------
// SECURITY HELPERS
//-----------------------------------------------------
/**
 * Escapes HTML special characters to prevent injection when interpolating
 * @param {string} str
 * @returns {string}
 */
const escapeHtml = (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

/**
 * Recursively escapes every string value in an object/array —
 * useful for sanitizing AI-generated payloads before HTML rendering.
 */
const escapeHtmlDeep = (value) => {
    if (typeof value === 'string') return escapeHtml(value);
    if (Array.isArray(value)) return value.map(escapeHtmlDeep);
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([k, v]) => [k, escapeHtmlDeep(v)])
        );
    }
    return value; // numbers, booleans, null unchanged
};

module.exports = { 
    validateNormalEmail,
    validateNITKKREmail,
    validateContactNumber,
    validateIdentifier,
    validatePassword, 
    validateOtp,
    validateDate, 

    getISTDateString,
    getDayOfWeek ,

    getIdsFromItems,
    verifyOtpSafely,
    canPurchaseMeal,

    escapeHtml,
    escapeHtmlDeep,
};