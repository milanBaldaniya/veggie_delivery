const yup = require('yup');

const updateMeSchema = yup.object({
  name: yup.string().trim().min(2, 'Name is too short').required('Name is required'),
  // Delivery contact number — Google Sign-In gives us an email, so the phone is
  // collected here during profile setup.
  phone: yup
    .string()
    .trim()
    .matches(/^\+?[0-9]{7,15}$/, 'Enter a valid phone number')
    .required('Phone number is required'),
  // Free-text delivery address. Building + flat are what the vendor needs to
  // reach the door; wing/landmark are optional.
  address: yup
    .object({
      building: yup.string().trim().min(2, 'Building/society is too short').required('Building/society is required'),
      wing: yup.string().trim().nullable(),
      flat: yup.string().trim().required('Flat number is required'),
      landmark: yup.string().trim().nullable(),
    })
    .required('Address is required'),
});

module.exports = { updateMeSchema };
