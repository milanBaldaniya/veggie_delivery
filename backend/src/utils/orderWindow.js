const env = require('../config/env');

// Current hour (0–23) in the given IANA timezone, independent of the server's
// own clock/timezone. `h23` keeps midnight as 0 rather than 24.
function currentHourInZone(timezone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  return Number(parts.find((p) => p.type === 'hour').value);
}

function formatCutoffLabel(hour) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:00 ${period}`;
}

/**
 * Whether ordering is currently allowed, plus a customer-facing message.
 * Open only strictly before the cutoff hour (e.g. at 12:00 PM it's closed).
 */
function getWindowStatus() {
  const { cutoffHour, timezone } = env.order;
  const isOpen = currentHourInZone(timezone) < cutoffHour;
  const cutoffLabel = formatCutoffLabel(cutoffHour);

  return {
    isOpen,
    cutoffHour,
    cutoffLabel,
    timezone,
    message: isOpen
      ? `Order before ${cutoffLabel} to get today's delivery.`
      : `Order window is closed. Orders are accepted only before ${cutoffLabel}.`,
  };
}

module.exports = { getWindowStatus };
