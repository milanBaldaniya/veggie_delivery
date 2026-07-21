import dayjs from 'dayjs';

export const formatCurrency = (amount) => {
  const value = Number(amount) || 0;
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

export const formatWeight = (grams) => {
  const g = Number(grams) || 0;
  if (g < 1000) return `${g} g`;
  const kg = g / 1000;
  return `${Number.isInteger(kg) ? kg : Number(kg.toFixed(2))} kg`;
};

export const formatDate = (iso) => (iso ? dayjs(iso).format('DD MMM YYYY') : '—');
export const formatDateTime = (iso) => (iso ? dayjs(iso).format('DD MMM YYYY, hh:mm A') : '—');

export const formatAddress = (a) => {
  if (!a) return '—';
  return [a.flat && `Flat ${a.flat}`, a.wing && `Wing ${a.wing}`, a.building, a.landmark]
    .filter(Boolean)
    .join(', ');
};
