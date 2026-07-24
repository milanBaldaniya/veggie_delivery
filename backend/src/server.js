const env = require('./config/env');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const app = require('./app');
const { startWeeklyBillingJob } = require('./jobs/weeklyBilling.job');
const seedSuperAdmin = require('./seeders/seedSuperAdmin');

async function start() {
  await connectDB();
  logger.info('MongoDB connected');

  // Idempotent — ensures the Super Admin account exists on every boot so no
  // manual seeding step is needed in any environment (including prod).
  const { email } = await seedSuperAdmin();
  logger.info(`Super Admin ready (${email})`);

  // Automatic weekly bill finalization (offline collection stays manual).
  startWeeklyBillingJob();

  const server = app.listen(env.port, () => {
    logger.info(`Server listening on port ${env.port} (${env.nodeEnv})`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
