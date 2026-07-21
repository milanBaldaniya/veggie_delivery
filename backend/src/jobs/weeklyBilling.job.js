const cron = require('node-cron');
const Order = require('../models/Order');
const billingService = require('../services/billingService');
const { weekBounds } = require('../utils/billingPeriod');
const { ORDER_STATUS } = require('../config/constants');
const env = require('../config/env');
const logger = require('../utils/logger');

// Finalizes the previous week's weekly bills for every customer who ordered in
// it. Weekly bills already accrue live as orders are placed, so this scheduled
// pass is the safety net that "closes" a completed week — guaranteeing each week
// ends with a finalized bill even if a user's last recompute predated something.
async function finalizePreviousWeek(ref = new Date()) {
  const lastWeekRef = new Date(ref);
  lastWeekRef.setDate(lastWeekRef.getDate() - 7);
  const { start, end } = weekBounds(lastWeekRef);

  const userIds = await Order.distinct('user', {
    createdAt: { $gte: start, $lt: end },
    status: { $ne: ORDER_STATUS.CANCELLED },
  });

  let count = 0;
  for (const uid of userIds) {
    if (!uid) continue;
    try {
      const bill = await billingService.recomputeWeeklyBill(uid, lastWeekRef);
      if (bill) count += 1;
    } catch (err) {
      logger.error(`Weekly billing finalize failed for user ${uid}: ${err.message}`);
    }
  }

  logger.info(
    `Weekly billing: finalized ${count} bill(s) for ${start.toDateString()} – ${end.toDateString()}`
  );
  return count;
}

function startWeeklyBillingJob() {
  const schedule = env.billing.weeklyCron;
  if (!cron.validate(schedule)) {
    logger.error(`Invalid WEEKLY_BILLING_CRON "${schedule}" — weekly billing job not scheduled`);
    return;
  }

  cron.schedule(
    schedule,
    () => {
      finalizePreviousWeek().catch((err) => logger.error(`Weekly billing job error: ${err.message}`));
    },
    { timezone: env.order.timezone }
  );

  logger.info(`Weekly billing job scheduled (${schedule}, ${env.order.timezone})`);
}

module.exports = { startWeeklyBillingJob, finalizePreviousWeek };
