const yup = require('yup');

const updateLegalContentSchema = yup.object({
  title: yup.string().trim().default(''),
  contentHtml: yup.string().trim().required('Content is required'),
});

module.exports = { updateLegalContentSchema };
