import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Header, Badge, EmptyState, Loader } from '../../components/common';
import { colors, spacing, radius, typography } from '../../theme';
import { formatCurrency, formatWeight, formatDate, formatBillPeriod } from '../../utils/format';
import {
  BILL_STATUS_LABELS,
  BILL_STATUS_COLORS,
  BILL_PERIOD_LABELS,
} from '../../constants/billStatus';
import { fetchBill, selectBillById } from '../../redux/slices/billsSlice';

function SummaryRow({ label, value, strong, accent }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text
        style={[
          styles.rowValue,
          strong && styles.rowValueStrong,
          accent && { color: colors.primaryDark },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export default function BillDetailsScreen({ route, navigation }) {
  const { billId } = route.params || {};
  const dispatch = useDispatch();
  // Instant render from the list summary, then the full card (with orders).
  const summary = useSelector(selectBillById(billId));
  const current = useSelector((state) => state.bills.current);
  const currentStatus = useSelector((state) => state.bills.currentStatus);

  useEffect(() => {
    if (billId) dispatch(fetchBill(billId));
  }, [dispatch, billId]);

  const bill = current?.id === billId ? current : summary;

  if (!bill) {
    return (
      <View style={styles.container}>
        <Header title="Bill" onBack={() => navigation.goBack()} />
        {currentStatus === 'loading' ? (
          <Loader />
        ) : (
          <EmptyState title="Bill not found" message="This bill is no longer available." />
        )}
      </View>
    );
  }

  const balance = Math.max(0, bill.totalAmount - bill.paidAmount);
  const orders = bill.orders || [];
  const payments = bill.payments || [];
  const weekLabel = bill.weekNumber
    ? `Week ${bill.weekNumber}`
    : BILL_PERIOD_LABELS[bill.periodType] || bill.periodType;

  return (
    <View style={styles.container}>
      <Header title="Bill details" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Text style={styles.period}>{weekLabel}</Text>
            <Badge
              label={BILL_STATUS_LABELS[bill.status] || bill.status}
              color={BILL_STATUS_COLORS[bill.status] || colors.textSecondary}
            />
          </View>
          <Text style={styles.range}>{formatBillPeriod(bill.periodStart, bill.periodEnd)}</Text>
        </View>

        <View style={styles.card}>
          <SummaryRow label={`Orders (${bill.orderCount})`} value={formatCurrency(bill.totalAmount)} />
          <SummaryRow label="Total quantity" value={formatWeight(bill.totalQuantityGrams || 0)} />
          <SummaryRow label="Amount paid" value={formatCurrency(bill.paidAmount)} />
          <View style={styles.divider} />
          <SummaryRow
            label="Balance due"
            value={balance > 0 ? formatCurrency(balance) : 'Cleared'}
            strong
            accent
          />
          {bill.paymentCollectedAt ? (
            <Text style={styles.collectedNote}>
              Collected on {formatDate(bill.paymentCollectedAt)}
            </Text>
          ) : null}
          {bill.notes ? <Text style={styles.notes}>Note: {bill.notes}</Text> : null}
        </View>

        <Text style={styles.sectionTitle}>Orders this week</Text>
        <View style={styles.card}>
          {orders.length === 0 ? (
            <Text style={styles.muted}>No orders in this period yet.</Text>
          ) : (
            orders.map((o, i) => (
              <View key={String(o.order || i)} style={[styles.lineRow, i > 0 && styles.rowBorder]}>
                <View style={styles.lineLeft}>
                  <Text style={styles.lineTitle}>{formatDate(o.placedAt)}</Text>
                  <Text style={styles.lineMeta}>{formatWeight(o.quantityGrams || 0)}</Text>
                </View>
                <Text style={styles.lineAmount}>{formatCurrency(o.amount)}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>Payments</Text>
        <View style={styles.card}>
          {payments.length === 0 ? (
            <Text style={styles.muted}>
              No payments recorded yet. Our delivery team collects cash for this bill.
            </Text>
          ) : (
            payments.map((p, i) => (
              <View key={i} style={[styles.lineRow, i > 0 && styles.rowBorder]}>
                <View style={styles.lineLeft}>
                  <Text style={styles.lineTitle}>{formatCurrency(p.amount)}</Text>
                  <Text style={styles.lineMeta}>
                    {(p.method || 'cash').toUpperCase()} · {formatDate(p.paidAt)}
                  </Text>
                  {p.note ? <Text style={styles.notes}>{p.note}</Text> : null}
                </View>
                <Text style={styles.tick}>✓</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  period: { ...typography.h3 },
  range: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  rowLabel: { ...typography.body, color: colors.textSecondary },
  rowValue: { ...typography.body },
  rowValueStrong: { ...typography.h3 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.xs },
  collectedNote: { ...typography.caption, color: colors.success, marginTop: spacing.sm },
  notes: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs, fontStyle: 'italic' },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  muted: { ...typography.body, color: colors.textSecondary },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
  lineLeft: { flex: 1 },
  lineTitle: { ...typography.bodyBold },
  lineMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  lineAmount: { ...typography.bodyBold, marginLeft: spacing.md },
  tick: { color: colors.success, fontSize: 18, fontWeight: '700', marginLeft: spacing.md },
});
