const { z } = require('zod');
const { hostelNameField, residentsField, normalEmailField, loginIdField, strongPasswordField, hostelIdField, studentIdentifierField, contactNumberField, otpField  } = require('../common/fields.zod');

// ------------Shared primitives----------

const optionalNormalEmailField = (label = 'Email') => z.union([z.literal(''), normalEmailField(label)]).optional().default(''); // '' || 'properEmail' || null/undefined
const optionalContactNoField = (label = 'Contact Number') => z.union([z.literal(''), contactNumberField(label)]).optional().default(''); // '' || 'properContact' || undefined/null
const optionalStrongPasswordField = z.union([z.literal(''), strongPasswordField]).optional().default('');

//hostel forma data
const hostelSharedFields = {
    name: hostelNameField,
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
    id: hostelIdField,
});

// ---------------------------------------------
// DELETE /hostels/:hostelId/remove — body
// ---------------------------------------------
const hostelRemovalBodySchema = z.object({
    otp: otpField,
});

// ---------------------------------------------
// GET /hostels/:hostelId/students
// DELETE /hostels/:hostelId/students/remove
// DELETE /hostels/:hostelId/remove
// ---------------------------------------------
const hostelIdParamSchema = z.object({
    hostelId: hostelIdField,
});

// ---------------------------------------------
// DELETE /hostels/:hostelId/students/remove — body
// ---------------------------------------------
const batchRemovalBodySchema = z.object({
    studentIdentifiers: z
        .array(studentIdentifierField, { error: 'studentIdentifiers must be array.' })
        .min(1, 'Length must be 1-300.')
        .max(300, 'Length must be 1-300.'),
    otp: otpField,
});

module.exports = {
    createHostelSchema,
    updateHostelSchema,
    hostelIdAsIdParamSchema,
    hostelIdParamSchema,
    hostelRemovalBodySchema,
    batchRemovalBodySchema,
};