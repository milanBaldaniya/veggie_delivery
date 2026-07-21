const yup = require('yup');
const { PRODUCT_UNITS } = require('../../config/constants');

const createProductSchema = yup.object({
  name: yup.string().trim().min(2, 'Name is too short').required('Name is required'),
  emoji: yup.string().trim().default('🥬'),
  imageUrl: yup.string().trim().nullable(),
  category: yup.string().trim().default('Vegetable'),
  pricePerKg: yup.number().typeError('Price must be a number').min(0, 'Price cannot be negative').required('Price is required'),
  unit: yup.string().oneOf(PRODUCT_UNITS, 'Invalid unit').default('kg'),
  description: yup.string().trim().nullable(),
  inStock: yup.boolean().default(true),
  sortOrder: yup.number().default(100),
});

// All fields optional on update.
const updateProductSchema = yup.object({
  name: yup.string().trim().min(2, 'Name is too short'),
  emoji: yup.string().trim(),
  imageUrl: yup.string().trim().nullable(),
  category: yup.string().trim(),
  pricePerKg: yup.number().typeError('Price must be a number').min(0, 'Price cannot be negative'),
  unit: yup.string().oneOf(PRODUCT_UNITS, 'Invalid unit'),
  description: yup.string().trim().nullable(),
  inStock: yup.boolean(),
  sortOrder: yup.number(),
});

const toggleSchema = yup.object({
  inStock: yup.boolean(),
});

module.exports = { createProductSchema, updateProductSchema, toggleSchema };
