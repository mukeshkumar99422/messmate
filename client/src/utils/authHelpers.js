// email validators
export const validateNormalEmail = (email) => {
     if (!email || email.length > 254) return false;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})*$/;
    return emailRegex.test(email);
}
export const validateNITKKREmail = (email) => {
    const nitkDomain = '@nitkkr.ac.in';
    return validateNormalEmail(email) && email.endsWith(nitkDomain);
}

// password validator
export const validatePassword = (password) => {
    if (!password || password.length < 6 || password.length > 72) {
        return false;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()-+]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

