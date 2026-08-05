import {z} from "zod";
import { contactNumberField, hostelNameField, loginIdField, normalEmailField, otpField, residentsField, strongPasswordField, studentIdentifierField } from "./common";

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

//add new hostel
export const createHostelSchema = z.object({
    ...hostelSharedFields,
    password: strongPasswordField,
});

//update hostel
export const updateHostelSchema = z.object({
    ...hostelSharedFields,
    password: optionalStrongPasswordField,
});

// remove students account
export const batchRemovalBodySchema = z.object({
    studentIdentifiers: z
        .array(studentIdentifierField, { error: 'studentIdentifiers must be array.' })
        .min(1, 'Length must be 1-300.')
        .max(300, 'Length must be 1-300.'),
    otp: otpField,
});