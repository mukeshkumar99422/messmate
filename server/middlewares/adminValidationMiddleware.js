const {validateNormalEmail, validatePasswordStrength, validateNITKKREmail} = require('../utils/helpers');

// ============================================================
// VALIDATION FOR HOSTEL CREATION & UPDATES (ADMIN)
// ============================================================
const validateHostelPayload = (req, res, next) => {
    const { name, residents, accountantContactNo, accountantEmail, hostelContactNo, hostelEmail, loginId, password } = req.body;

    // 1. Mandatory Fields Presence Check (Password is only mandatory for creating new hostels)
    if (!name || !residents || !hostelEmail || !loginId) {
        return res.status(400).json({ message: "All required fields must be provided." });
    }
    if (req.method === 'POST' && !password) {
        return res.status(400).json({ message: "Password required for new hostel." });
    }

    // 2. Sanitize & Validate Hostel Name
    const cleanName = String(name).trim();
    if (cleanName.length < 3 || cleanName.length > 100) {
        return res.status(400).json({ message: "Hostel name: 3-100 characters." });
    }

    // 3. Strict Enum Boundary for Occupant Type
    const cleanResidents = String(residents).trim().toLowerCase();
    if (!['boys', 'girls'].includes(cleanResidents)) {
        return res.status(400).json({ message: "Only 'boys' or 'girls' allowed." });
    }

    // 4. Email Formatting Checks
    if (!validateNormalEmail(String(hostelEmail).trim())) {
        return res.status(400).json({ message: "Invalid hostel email format." });
    }
    if (accountantEmail && !validateNormalEmail(String(accountantEmail).trim())) {
        return res.status(400).json({ message: "Invalid accountant email." });
    }

    // 5. Secure Credentials Boundaries (Aligned with Bcrypt limits)
    const cleanLoginId = String(loginId).trim();
    if (cleanLoginId.length < 3 || cleanLoginId.length > 30) {
        return res.status(400).json({ message: "Login ID: 3-30 characters." });
    }

    if (password && !validatePasswordStrength(password)) {
        return res.status(400).json({ message: "Invalid password format." });
    }

    // Re-assign explicitly sanitized clean fields back onto the request frame
    req.body.name = cleanName;
    req.body.residents = cleanResidents;
    req.body.hostelEmail = String(hostelEmail).trim().toLowerCase();
    req.body.accountantEmail = accountantEmail ? String(accountantEmail).trim().toLowerCase() : '';
    req.body.loginId = cleanLoginId;
    req.body.hostelContactNo = hostelContactNo ? String(hostelContactNo).trim() : '';
    req.body.accountantContactNo = accountantContactNo ? String(accountantContactNo).trim() : '';

    next();
};

// ============================================================
// VALIDATION FOR BATCH STUDENT ACCOUNT REMOVAL (ADMIN)
// ============================================================
const validateBatchRemoval = (req, res, next) => {
    const { studentIdentifiers } = req.body;
    const { hostelId } = req.params;

    // 1. URL Parameter Verification Check
    if (!hostelId || isNaN(Number(hostelId))) {
        return res.status(400).json({ message: "Valid numerical Hostel ID required." });
    }

    // 2. Validate Container Structure
    if (!studentIdentifiers || !Array.isArray(studentIdentifiers)) {
        return res.status(400).json({ message: "studentIdentifiers must be array." });
    }

    // 3. Prevent Array Payload Floods (Denial-of-Service Defense boundary)
    if (studentIdentifiers.length === 0 || studentIdentifiers.length>300) {
        return res.status(400).json({ message: "Length must be 1-300." });
    }

    // 4. Email Formatting Array Scanner Check
    const allValidEmails = studentIdentifiers.every(email => validateNITKKREmail(String(email).trim().toLowerCase()));

    if (!allValidEmails) {
        return res.status(400).json({ message: "All identifiers must be valid emails." });
    }

    // Sanitize values inside array clean elements frame
    req.body.studentIdentifiers = studentIdentifiers.map(email => String(email).trim().toLowerCase());

    next();
};

module.exports = {
  validateHostelPayload,
  validateBatchRemoval
}