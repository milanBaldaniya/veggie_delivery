const ROLES = Object.freeze({
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
});

const USER_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED',
});

const ORDER_STATUS = Object.freeze({
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  PACKED: 'PACKED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
});

// Allowed forward transitions for admin order status updates.
const ORDER_STATUS_TRANSITIONS = Object.freeze({
  PENDING: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['PACKED', 'CANCELLED'],
  PACKED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
});

const BILL_STATUS = Object.freeze({
  PENDING: 'PENDING',
  PAID: 'PAID',
});

const PRODUCT_UNITS = Object.freeze(['kg', 'gram', 'piece', 'bunch', 'dozen']);

module.exports = {
  ROLES,
  USER_STATUS,
  ORDER_STATUS,
  ORDER_STATUS_TRANSITIONS,
  BILL_STATUS,
  PRODUCT_UNITS,
};
