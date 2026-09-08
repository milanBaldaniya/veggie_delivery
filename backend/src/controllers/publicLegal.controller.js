const asyncHandler = require('../utils/asyncHandler');
const LegalContent = require('../models/LegalContent');
const { LEGAL_CONTENT_SLUGS } = require('../config/constants');

const SLUG_TO_TYPE = Object.fromEntries(
  Object.entries(LEGAL_CONTENT_SLUGS).map(([type, slug]) => [slug, type])
);

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function renderPage({ title, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 32px 20px 64px; color: #1f2937; line-height: 1.6; }
  h1 { font-size: 24px; margin-bottom: 4px; }
  .updated { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
  a { color: #2e7d32; }
  ul, ol { padding-left: 24px; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

// Public, unauthenticated HTML page (e.g. /legal/privacy-policy) — this is
// the URL to paste into Google Play Console's "Privacy Policy" field, which
// requires a plain public web page, not just an in-app screen.
const renderLegalPage = asyncHandler(async (req, res) => {
  const type = SLUG_TO_TYPE[req.params.slug];
  if (!type) {
    return res.status(404).send(renderPage({ title: 'Not found', bodyHtml: '<h1>Page not found</h1>' }));
  }

  const doc = await LegalContent.findOne({ type });
  const title = doc?.title || req.params.slug.replace(/-/g, ' ');
  const bodyHtml = doc?.contentHtml
    ? `<h1>${escapeHtml(title)}</h1>${
        doc.updatedAt ? `<div class="updated">Last updated ${new Date(doc.updatedAt).toLocaleDateString()}</div>` : ''
      }${doc.contentHtml}`
    : `<h1>${escapeHtml(title)}</h1><p>This page hasn't been published yet.</p>`;

  res.status(200).type('html').send(renderPage({ title, bodyHtml }));
});

module.exports = { renderLegalPage };
