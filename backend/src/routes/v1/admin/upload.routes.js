const { Router } = require('express');
const multer = require('multer');
const ApiError = require('../../../utils/ApiError');
const controller = require('../../../controllers/admin/upload.controller');

// Keep the file in memory; we forward the buffer straight to Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(ApiError.badRequest('Only image files are allowed'));
  },
});

const router = Router();

router.post('/image', upload.single('image'), controller.uploadImage);

module.exports = router;
