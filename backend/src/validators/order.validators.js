const yup = require('yup');

const createOrderSchema = yup.object({
  items: yup
    .array()
    .of(
      yup.object({
        productId: yup.string().trim().required('productId is required'),
        // Weight in grams; customers add in 250g steps, so 50g is a safe floor.
        grams: yup
          .number()
          .typeError('grams must be a number')
          .integer('grams must be a whole number')
          .min(50, 'Minimum 50g per item')
          .max(50000, 'Maximum 50kg per item')
          .required('grams is required'),
      })
    )
    .min(1, 'Add at least one item to place an order')
    .required('items is required'),
});

module.exports = { createOrderSchema };
