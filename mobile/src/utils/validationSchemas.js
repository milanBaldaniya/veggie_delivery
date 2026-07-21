import * as yup from 'yup';

export const phoneSchema = yup
  .string()
  .trim()
  .matches(/^\+?[0-9]{7,15}$/, 'Enter a valid phone number')
  .required('Phone number is required');

export const profileSetupSchema = yup.object({
  name: yup.string().trim().min(2, 'Name is too short').required('Name is required'),
  // Google gives us an email, not a phone, so the delivery contact number is
  // collected here.
  phone: phoneSchema,
  // Delivery address — building + flat are what the vendor needs to reach the
  // door, so they're required; wing/landmark are optional.
  building: yup.string().trim().min(2, 'Enter your building/society').required('Building/society is required'),
  wing: yup.string().trim(),
  flat: yup.string().trim().required('Flat number is required'),
  landmark: yup.string().trim(),
});
