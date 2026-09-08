const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const v1Router = require('./routes/v1');
const { renderLegalPage } = require('./controllers/publicLegal.controller');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Cross-origin resource policy would otherwise block the APK from being
// downloaded when linked from a different origin (e.g. scanned from a QR
// code opened in a mobile browser).
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv !== 'test') {
  app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(env.apiPrefix, apiLimiter);

app.use(env.apiPrefix, v1Router);

// Static app downloads (e.g. /downloads/app-latest.apk) — update the file in
// backend/public/downloads/ and redeploy to publish a new release build.
app.use('/downloads', express.static(path.join(__dirname, '..', 'public', 'downloads')));

// Public legal pages (e.g. /legal/privacy-policy) — plain HTML, admin-edited
// content. This is the URL to give Google Play Console's Privacy Policy field.
app.get('/legal/:slug', renderLegalPage);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
