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

// Export helpers
export {
    validateNormalEmail,
    validateNITKKREmail,
    validateContactNumber,
    validateIdentifier,
    validatePassword,
    validateOtp,
    validateDate
};

