const ROLES = Object.freeze({
  CUSTOMER: 'CUSTOMER',
  // Staff roles that can access the admin panel.
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  ACCOUNTANT: 'ACCOUNTANT',
  WATCHMAN: 'WATCHMAN',
});

// Roles allowed to sign into the web admin panel (watchman uses the panel too,
// but with a restricted menu enforced per-endpoint).
const PANEL_ROLES = Object.freeze([
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.ACCOUNTANT,
  ROLES.WATCHMAN,
]);

// Full-access management roles (everything except watchman-only screens).
const MANAGEMENT_ROLES = Object.freeze([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT]);

const USER_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED',
});

// Order lifecycle. Aligned with the admin workflow: after the nightly cutoff an
// order is CONFIRMED, PACKED customer-wise, sent OUT_FOR_DELIVERY society-wise,
// then DELIVERED.
const ORDER_STATUS = Object.freeze({
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PACKED: 'PACKED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
});

// Allowed forward transitions for admin order status updates.
const ORDER_STATUS_TRANSITIONS = Object.freeze({
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKED', 'CANCELLED'],
  PACKED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
});

const BILL_STATUS = Object.freeze({
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
});

const BILL_PERIOD = Object.freeze({
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
});

const EXPENSE_CATEGORIES = Object.freeze([
  'VEGETABLE_PURCHASE',
  'FUEL',
  'TRANSPORTATION',
  'PACKING_MATERIAL',
  'SALARY',
  'MISCELLANEOUS',
]);

const SALARY_STATUS = Object.freeze({
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
});

const PRODUCT_UNITS = Object.freeze(['kg', 'gram', 'piece', 'bunch', 'dozen']);

module.exports = {
  ROLES,
  PANEL_ROLES,
  MANAGEMENT_ROLES,
  USER_STATUS,
  ORDER_STATUS,
  ORDER_STATUS_TRANSITIONS,
  BILL_STATUS,
  BILL_PERIOD,
  EXPENSE_CATEGORIES,
  SALARY_STATUS,
  PRODUCT_UNITS,
};
