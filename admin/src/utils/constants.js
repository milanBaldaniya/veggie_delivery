// Order lifecycle — mirrors the backend ORDER_STATUS enum. Colours map to AntD
// Tag presets so status reads consistently across tables and details.
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PACKED: 'PACKED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

export const ORDER_STATUS_META = {
  PENDING: { label: 'Pending', color: 'gold' },
  CONFIRMED: { label: 'Confirmed', color: 'blue' },
  PACKED: { label: 'Packed', color: 'purple' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'cyan' },
  DELIVERED: { label: 'Delivered', color: 'green' },
  CANCELLED: { label: 'Cancelled', color: 'red' },
};

export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_META).map(([value, m]) => ({
  value,
  label: m.label,
}));

// Allowed forward transitions — keeps the status dropdown honest.
export const ORDER_STATUS_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKED', 'CANCELLED'],
  PACKED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

export const ROLE_META = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'magenta' },
  ADMIN: { label: 'Admin', color: 'geekblue' },
  ACCOUNTANT: { label: 'Accountant', color: 'gold' },
  WATCHMAN: { label: 'Watchman', color: 'cyan' },
  CUSTOMER: { label: 'Customer', color: 'default' },
};

export const PRODUCT_UNITS = ['kg', 'gram', 'piece', 'bunch', 'dozen'];

export const USER_STATUS_META = {
  ACTIVE: { label: 'Active', color: 'green' },
  DISABLED: { label: 'Blocked', color: 'red' },
};

export const EXPENSE_CATEGORY_META = {
  VEGETABLE_PURCHASE: { label: 'Vegetable Purchase', color: 'green' },
  FUEL: { label: 'Fuel', color: 'volcano' },
  TRANSPORTATION: { label: 'Transportation', color: 'blue' },
  PACKING_MATERIAL: { label: 'Packing Material', color: 'purple' },
  SALARY: { label: 'Salary', color: 'gold' },
  MISCELLANEOUS: { label: 'Miscellaneous', color: 'default' },
};
export const EXPENSE_CATEGORY_OPTIONS = Object.entries(EXPENSE_CATEGORY_META).map(([value, m]) => ({
  value,
  label: m.label,
}));

export const PAYMENT_STATUS_META = {
  PENDING: { label: 'Pending', color: 'gold' },
  PARTIAL: { label: 'Partial', color: 'blue' },
  PAID: { label: 'Paid', color: 'green' },
};

export const BILL_PERIOD_OPTIONS = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
];

export const BRAND = { primary: '#2E7D32', name: 'Veggie Delivery' };
