// Rupee formatting: drops the decimals when the amount is a whole number so the
// UI reads "₹70" rather than "₹70.00", but keeps paise when present.
export function formatCurrency(amount) {
  const value = Number(amount) || 0;
  const rounded = Math.round(value * 100) / 100;
  const str = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
  return `₹${str}`;
}

// Human-friendly weight: grams under 1kg stay in grams, otherwise switch to kg
// trimming trailing zeros ("500 g", "1 kg", "1.25 kg").
export function formatWeight(grams) {
  const g = Number(grams) || 0;
  if (g < 1000) return `${g} g`;
  const kg = g / 1000;
  return `${Number.isInteger(kg) ? kg : Number(kg.toFixed(2))} kg`;
}

// Composes the one-line delivery address the vendor reads.
export function formatAddress(address) {
  if (!address) return '';
  const parts = [
    address.flat ? `Flat ${address.flat}` : null,
    address.wing ? `Wing ${address.wing}` : null,
    address.building,
    address.landmark,
  ].filter(Boolean);
  return parts.join(', ');
}

// A short date like "5 Jul 2026".
export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// A bill's coverage window, e.g. "1 Jul – 7 Jul 2026". periodEnd is stored
// exclusive (the day after the last covered day), so we show the day before it.
export function formatBillPeriod(startIso, endIso) {
  if (!startIso || !endIso) return '';
  const start = new Date(startIso);
  const lastDay = new Date(endIso);
  lastDay.setDate(lastDay.getDate() - 1);
  const startStr = start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const endStr = lastDay.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `${startStr} – ${endStr}`;
}
