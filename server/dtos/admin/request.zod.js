const { z } = require('zod');
const { validateNormalEmail, validateNITKKREmail, validateContactNumber, validateIdentifier, validatePasswordStrength } = require('../../utils/helpers');

// ---------------------------------------------
// Shared primitives
// ---------------------------------------------

//name
const nameField = z
    .string({ required_error: 'Hostel name is required' })
    .trim()
    .min(3, 'Hostel name: 3-100 characters.')
    .max(100, 'Hostel name: 3-100 characters.');

//residents
const residentsField = z
    .string({ required_error: 'Residents type is required' })
    .trim()
    .toLowerCase()
    .pipe(z.enum(['boys', 'girls'], { errorMap: () => ({ message: "Only 'boys' or 'girls' allowed." }) }));

//email
const normalEmailField = (label = 'Email') =>
    z.string({ required_error: `${label} is required` })
        .trim()
        .toLowerCase()
        .refine(validateNormalEmail, { message: `Invalid ${label.toLowerCase()} format.` });

const optionalNormalEmailField = (label = 'Email') => z.union([z.literal(''), normalEmailField(label)]).optional().default(''); // '' || 'properEmail' || null/undefined

//contact number
const contactNumberField = (label = 'Contact Number') =>
    z.string({ required_error: `${label} is required` })
        .trim()
        .refine(validateContactNumber, { message: `Invalid ${label} format.` });

const optionalContactNoField = (label = 'Contact Number') => z.union([z.literal(''), contactNumberField(label)]).optional().default(''); // '' || 'properContact' || undefined/null

//loginId, password
const loginIdField = z
    .string({ required_error: 'Login ID is required' })
    .trim()
    .refine(validateIdentifier, { message: 'Login ID: 3-30 characters.'})

const strongPasswordField = z
    .string()
    .refine(validatePasswordStrength, { message: 'Invalid password format.' });

const optionalStrongPasswordField = z.union([z.literal(''), strongPasswordField]).optional().default('');

//hostel forma data
const hostelSharedFields = {
    name: nameField,
    residents: residentsField,
    hostelEmail: normalEmailField('Hostel email'),
    accountantEmail: optionalNormalEmailField('Accountant email'),
    loginId: loginIdField,
    hostelContactNo: optionalContactNoField('Hostel Contact'),
    accountantContactNo: optionalContactNoField('Accountant Contact'),
};

// ---------------------------------------------
// POST /hostels — password is mandatory for new hostels
// ---------------------------------------------
const createHostelSchema = z.object({
    ...hostelSharedFields,
    password: strongPasswordField,
});

// ---------------------------------------------
// PUT /hostels/:id
// ---------------------------------------------
const updateHostelSchema = z.object({
    ...hostelSharedFields,
    password: optionalStrongPasswordField,
});

// ---------------------------------------------
// PUT /hostels/:id — :id param
// ---------------------------------------------
const hostelIdAsIdParamSchema = z.object({
    id: z.coerce.number({ invalid_type_error: 'Invalid hostel id', required_error: 'Invalid hostel id' }).int('Invalid hostel id'),
});

// ---------------------------------------------
// GET /hostels/:hostelId/students
// DELETE /hostels/:hostelId/students/remove
// :hostelId param — used by both routes below
// ---------------------------------------------
const hostelIdParamSchema = z.object({
    hostelId: z.coerce.number({ invalid_type_error: 'Valid numerical Hostel ID required.', required_error: 'Valid numerical Hostel ID required.' }).int('Valid numerical Hostel ID required.'),
});

// ---------------------------------------------
// DELETE /hostels/:hostelId/students/remove — body
// ---------------------------------------------
const studentIdentifierField = z
    .string({ required_error: 'Identifier is required' })
    .trim()
    .toLowerCase()
    .refine(validateNITKKREmail, { message: 'All identifiers must be valid emails.' });

const batchRemovalBodySchema = z.object({
    studentIdentifiers: z
        .array(studentIdentifierField, { required_error: 'studentIdentifiers must be array.' })
        .min(1, 'Length must be 1-300.')
        .max(300, 'Length must be 1-300.'),
});

module.exports = {
    createHostelSchema,
    updateHostelSchema,
    hostelIdAsIdParamSchema,
    hostelIdParamSchema,
    batchRemovalBodySchema,
};