const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const { sendSuccess } = require('../../utils/ApiResponse');
const cloudinary = require('../../config/cloudinary');
const env = require('../../config/env');

// Receives a single image (multer memory storage) and uploads it to Cloudinary,
// returning the hosted URL for the product form to store in `imageUrl`.
const uploadImage = asyncHandler(async (req, res) => {
  if (!env.cloudinary.isConfigured) {
    throw ApiError.badRequest(
      'Image uploads are not configured. Set CLOUDINARY_* variables in the backend .env.'
    );
  }
  if (!req.file) throw ApiError.badRequest('No image file provided');

  // Cloudinary's uploader takes a data URI; build one from the in-memory buffer.
  const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: env.cloudinary.folder,
    resource_type: 'image',
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  });

  sendSuccess(res, {
    message: 'Image uploaded',
    data: { url: result.secure_url, publicId: result.public_id },
  });
});

module.exports = { uploadImage };
