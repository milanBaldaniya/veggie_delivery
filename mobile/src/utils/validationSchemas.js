import * as yup from 'yup';

export const phoneSchema = yup
  .string()
  .trim()
  .matches(/^\+?[0-9]{7,15}$/, 'Enter a valid phone number')
  .required('Phone number is required');

export const loginSchema = yup.object({
  phone: phoneSchema,
});

export const otpSchema = yup.object({
  otp: yup
    .string()
    .trim()
    .matches(/^[0-9]+$/, 'OTP must be numeric')
    .required('OTP is required'),
});

export const profileSetupSchema = yup.object({
  name: yup.string().trim().min(2, 'Name is too short').required('Name is required'),
});
