const env = require('../config/env');
const DeliverySettings = require('../models/DeliverySettings');

// Current { hour (0-23), minute (0-59) } in the given IANA timezone,
// independent of the server's own clock/timezone.
function currentTimeInZone(timezone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  return {
    hour: Number(parts.find((p) => p.type === 'hour').value),
    minute: Number(parts.find((p) => p.type === 'minute').value),
  };
}

function toMinutes({ hour, minute }) {
  return hour * 60 + minute;
}

function formatTimeLabel({ hour, minute }) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${period}`;
}

// A cutoff of 00:00 (midnight) is never a meaningful "close immediately"
// instruction — it's the admin's way of saying orders are accepted all day,
// closing only at the very end of the day. Treat it as end-of-day (1440
// minutes) rather than start-of-day (0 minutes) so `now < cutoff` holds for
// every minute of the day.
function effectiveCutoffMinutes(cutoff) {
  const total = toMinutes(cutoff);
  return total === 0 ? 1440 : total;
}

/**
 * Whether ordering is currently allowed, plus the delivery window and a
 * customer-facing message. Open only strictly before the cutoff time.
 */
async function getWindowStatus() {
  const { timezone } = env.order;
  const settings = await DeliverySettings.getSingleton();
  const { deliveryStart, deliveryEnd, cutoff } = settings;

  const nowMinutes = toMinutes(currentTimeInZone(timezone));
  const isOpen = nowMinutes < effectiveCutoffMinutes(cutoff);
  const cutoffLabel = formatTimeLabel(cutoff);

  return {
    isOpen,
    cutoffLabel,
    deliveryStartLabel: formatTimeLabel(deliveryStart),
    deliveryEndLabel: formatTimeLabel(deliveryEnd),
    timezone,
    message: isOpen
      ? `Order before ${cutoffLabel} to get today's delivery.`
      : `Order window is closed. Orders are accepted only before ${cutoffLabel}.`,
  };
}

module.exports = { getWindowStatus };
