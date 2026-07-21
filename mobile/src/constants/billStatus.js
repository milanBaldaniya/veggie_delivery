import { colors } from '../theme';

export const BILL_STATUS = Object.freeze({
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
});

export const BILL_STATUS_LABELS = {
  [BILL_STATUS.PENDING]: 'Unpaid',
  [BILL_STATUS.PARTIAL]: 'Partially paid',
  [BILL_STATUS.PAID]: 'Paid',
};

export const BILL_STATUS_COLORS = {
  [BILL_STATUS.PENDING]: colors.billPending,
  [BILL_STATUS.PARTIAL]: colors.info,
  [BILL_STATUS.PAID]: colors.billPaid,
};

export const BILL_PERIOD = Object.freeze({
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
});

export const BILL_PERIOD_LABELS = {
  [BILL_PERIOD.WEEKLY]: 'Weekly',
  [BILL_PERIOD.MONTHLY]: 'Monthly',
};
