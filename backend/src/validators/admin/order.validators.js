const yup = require('yup');
const { ORDER_STATUS } = require('../../config/constants');

const updateStatusSchema = yup.object({
  status: yup
    .string()
    .oneOf(Object.values(ORDER_STATUS), 'Invalid status')
    .required('Status is required'),
});

module.exports = { updateStatusSchema };
