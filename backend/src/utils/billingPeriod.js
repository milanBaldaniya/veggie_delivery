// Period boundaries for billing. Shared by the live weekly-bill accrual (each
// order rolls into its week) and the admin's on-demand bill generation, so both
// bucket orders into exactly the same windows. `end` is exclusive.
//
// Anchored to env.order.timezone (not the host process's ambient timezone):
// plain `Date.setHours(0,0,0,0)` resolves "midnight" using whatever timezone
// the Node process happens to be running in, which differs between a dev
// machine and production (almost always UTC) — and even between two
// processes on the same dev machine depending on how each was launched. That
// mismatch silently buckets the same real-world order into two different
// "weeks" depending on which process computed it, producing duplicate bills
// for what should be one weekly bill.

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const env = require('../config/env');

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = env.order.timezone;

// Start of day (TZ-local) through the start of the next day (exclusive).
function dayBounds(ref) {
  const start = dayjs.tz(ref, TZ).startOf('day');
  const end = start.add(1, 'day');
  return { start: start.toDate(), end: end.toDate() };
}

// Calendar date (YYYY-MM-DD) that `ref` falls on in TZ — for date labels/keys
// derived from an instant, so they match the day a user actually experienced
// rather than whatever UTC day that instant happens to fall on (an IST
// midnight instant is still the *previous* UTC calendar day).
function formatDateKey(ref) {
  return dayjs.tz(ref, TZ).format('YYYY-MM-DD');
}

function monthBounds(ref) {
  const start = dayjs.tz(ref, TZ).startOf('month');
  const end = start.add(1, 'month');
  return { start: start.toDate(), end: end.toDate() };
}

// Monday 00:00 (TZ-local) through the following Monday 00:00 (exclusive).
function weekBounds(ref) {
  const zoned = dayjs.tz(ref, TZ).startOf('day');
  const dayIndex = (zoned.day() + 6) % 7; // Monday = 0
  const start = zoned.subtract(dayIndex, 'day');
  const end = start.add(7, 'day');
  return { start: start.toDate(), end: end.toDate() };
}

// ISO-8601 week number (weeks start Monday; week 1 contains the year's first
// Thursday). Returns { week, year } — the ISO year can differ from the calendar
// year around Jan 1 / Dec 31, so we carry both.
function getISOWeek(ref) {
  const zoned = dayjs.tz(ref, TZ).startOf('day');
  const dayIndex = (zoned.day() + 6) % 7;
  const thursday = zoned.add(3 - dayIndex, 'day');

  const week1 = dayjs.tz(`${thursday.year()}-01-04`, TZ).startOf('day');
  const week1DayIndex = (week1.day() + 6) % 7;
  const week1Monday = week1.subtract(week1DayIndex, 'day');

  const week = 1 + Math.round(thursday.diff(week1Monday, 'day') / 7);
  return { week, year: thursday.year() };
}

module.exports = { dayBounds, monthBounds, weekBounds, getISOWeek, formatDateKey, TZ };
