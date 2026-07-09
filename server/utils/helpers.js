const validateNormalEmail = (email) => {
     if (!email || email.length > 254) return false;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})*$/;
    return emailRegex.test(email);
}

const validateNITKKREmail = (email) => {
    const nitkDomain = '@nitkkr.ac.in';
    return validateNormalEmail(email) && email.endsWith(nitkDomain);
}

const validatePasswordStrength = (password) => {
    if (!password || password.length < 6 || password.length > 72) {
        return false;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()-+]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

const validateDate = (dateString) =>{
    // Regex pattern for YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    if (!dateString || !dateRegex.test(dateString)) return false;

    //is it an actual date
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) return false;

    return true;
}


// Returns date formatted explicitly matching "YYYY-MM-DD" for Asia/Kolkata: 
// works even at deployment, where server uses simple UTC 
const getISTDateString = () => {
    const date = new Date();
    return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};


const getDayOfWeek = (dateString) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const date = dateString ? new Date(dateString) : getISTDateString();
    return days[date.getDay()];
};

module.exports = { 
    validateNormalEmail,
    validateNITKKREmail, 
    validatePasswordStrength, 
    validateDate, 
    getISTDateString,
    getDayOfWeek 
};