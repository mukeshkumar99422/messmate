import { z } from "zod";
import { nitkkrEmailField, identifierField, passwordField, strongPasswordField, otpField, hostelIdField, studentNameField } from "./common";

// login schemas
export const loginSchema = z.object({
  identifier: identifierField,
  password: passwordField,
});

export const loginOtpSchema = z.object({
  identifier: identifierField,
  otp: otpField,
});

//signup schema
export const signupSchema = z
  .object({
    name: studentNameField,
    identifier: nitkkrEmailField,
    hostel: hostelIdField,
    password: strongPasswordField,
    c_password: z.string(),
  })
  .refine((d) => d.password === d.c_password, {
    message: "Passwords do not match",
    path: ["c_password"],
  });


//verify email schema
export const verifyEmailSchema = z
  .object({
    email: nitkkrEmailField,
    otp: otpField
  });


//forget password schemas
export const forgotPasswordSchema = z.object({
  identifier: identifierField,
  otp: otpField,
  new: strongPasswordField,
  confirm: z.string(),
})
.refine((d)=> d.new === d.confirm, {
  message: "Password do not match",
  path: ["conifirm"]
});