const yup = require('yup');

const updateMeSchema = yup.object({
  name: yup.string().trim().min(2, 'Name is too short').required('Name is required'),
  // building/wing/flat picker is wired in the Buildings/Wings/Flats phase.
  building: yup.string().nullable(),
  wing: yup.string().nullable(),
  flat: yup.string().nullable(),
});

module.exports = { updateMeSchema };
