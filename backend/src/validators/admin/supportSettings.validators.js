const yup = require('yup');

const faqSchema = yup.object({
  question: yup.string().trim().min(2, 'Question is too short').required('Question is required'),
  answer: yup.string().trim().min(2, 'Answer is too short').required('Answer is required'),
});

const updateSupportSettingsSchema = yup.object({
  callNumber: yup.string().trim().default(''),
  whatsappNumber: yup.string().trim().default(''),
  whatsappLink: yup.string().trim().default(''),
  email: yup.string().trim().email('Enter a valid email').default(''),
  hours: yup.string().trim().default(''),
  faqs: yup.array().of(faqSchema).default([]),
});

module.exports = { updateSupportSettingsSchema };
