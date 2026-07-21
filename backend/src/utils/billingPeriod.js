// Period boundaries for billing. Shared by the live weekly-bill accrual (each
// order rolls into its week) and the admin's on-demand bill generation, so both
// bucket orders into exactly the same windows. `end` is exclusive.

function monthBounds(ref) {
  const d = new Date(ref);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return { start, end };
}

// Monday 00:00 through the following Monday 00:00 (exclusive).
function weekBounds(ref) {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

// ISO-8601 week number (weeks start Monday; week 1 contains the year's first
// Thursday). Returns { week, year } — the ISO year can differ from the calendar
// year around Jan 1 / Dec 31, so we carry both.
function getISOWeek(ref) {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  // Thursday of the current week decides the ISO year.
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  week1.setDate(week1.getDate() - ((week1.getDay() + 6) % 7));
  const week = 1 + Math.round((d - week1) / (7 * 24 * 60 * 60 * 1000));
  return { week, year: d.getFullYear() };
}

module.exports = { monthBounds, weekBounds, getISOWeek };
