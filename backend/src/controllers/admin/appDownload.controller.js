const QRCode = require('qrcode');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/ApiResponse');
const env = require('../../config/env');

// Static file served from public/downloads/ (see app.js) — replace it with the
// new build and redeploy to publish a new release, no code change needed.
const APK_PATH = '/downloads/app-latest.apk';

const getDownloadQr = asyncHandler(async (req, res) => {
  const downloadUrl = `${env.publicUrl}${APK_PATH}`;
  const qrCode = await QRCode.toDataURL(downloadUrl, { width: 512, margin: 1 });
  sendSuccess(res, { data: { downloadUrl, qrCode } });
});

module.exports = { getDownloadQr };
