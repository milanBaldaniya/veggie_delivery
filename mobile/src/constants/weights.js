// Weight packs a customer can add for any vegetable. Ordering is per-weight —
// there are no unit counts — so these grams values drive both the picker and
// the cart's +/- stepper increment.
export const WEIGHT_OPTIONS = Object.freeze([
  { label: '250 g', grams: 250 },
  { label: '500 g', grams: 500 },
  { label: '1 kg', grams: 1000 },
]);

export const DEFAULT_WEIGHT_GRAMS = 500;
