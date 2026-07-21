const yup = require('yup');
const { USER_STATUS } = require('../../config/constants');

// ---- Buildings ----
const createBuildingSchema = yup.object({
  name: yup.string().trim().min(2, 'Name is too short').required('Name is required'),
  code: yup.string().trim().nullable(),
  area: yup.string().trim().nullable(),
  wings: yup.array().of(yup.string().trim()).default([]),
  watchman: yup.string().trim().nullable(),
});
const updateBuildingSchema = yup.object({
  name: yup.string().trim().min(2, 'Name is too short'),
  code: yup.string().trim().nullable(),
  area: yup.string().trim().nullable(),
  wings: yup.array().of(yup.string().trim()),
  watchman: yup.string().trim().nullable(),
  isActive: yup.boolean(),
});
const assignWatchmanSchema = yup.object({
  watchmanId: yup.string().trim().nullable(),
});

// ---- Watchmen (staff users) ----
const createWatchmanSchema = yup.object({
  name: yup.string().trim().min(2, 'Name is too short').required('Name is required'),
  phone: yup.string().trim().nullable(),
  email: yup.string().trim().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});
const updateWatchmanSchema = yup.object({
  name: yup.string().trim().min(2, 'Name is too short'),
  phone: yup.string().trim().nullable(),
  email: yup.string().trim().email('Enter a valid email'),
  password: yup.string().min(6, 'Password must be at least 6 characters'),
  status: yup.string().oneOf(Object.values(USER_STATUS), 'Invalid status'),
});

// ---- Customer status ----
const setStatusSchema = yup.object({
  status: yup.string().oneOf(Object.values(USER_STATUS), 'Invalid status').required('Status is required'),
});

module.exports = {
  createBuildingSchema,
  updateBuildingSchema,
  assignWatchmanSchema,
  createWatchmanSchema,
  updateWatchmanSchema,
  setStatusSchema,
};
