import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Loader, EmptyState, Badge } from '../../components/common';
import { colors, spacing, radius, typography } from '../../theme';
import { formatCurrency, formatBillPeriod } from '../../utils/format';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import {
  BILL_STATUS_LABELS,
  BILL_STATUS_COLORS,
  BILL_PERIOD,
  BILL_PERIOD_LABELS,
} from '../../constants/billStatus';
import { fetchBills } from '../../redux/slices/billsSlice';

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: BILL_PERIOD.WEEKLY, label: 'Weekly' },
  { key: BILL_PERIOD.MONTHLY, label: 'Monthly' },
];

export default function BillsScreen({ navigation }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { list, totalDue, listStatus } = useSelector((state) => state.bills);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    dispatch(fetchBills());
  }, [dispatch]);

  const visibleBills = useMemo(
    () => (filter === 'ALL' ? list : list.filter((b) => b.periodType === filter)),
    [list, filter]
  );

  if (listStatus === 'loading' && list.length === 0) {
    return <Loader />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Text style={styles.title}>My Bills</Text>
      </View>

      <FlatList
        data={visibleBills}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={listStatus === 'loading'}
            onRefresh={() => dispatch(fetchBills())}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.dueCard}>
              <Text style={styles.dueLabel}>Total amount due</Text>
              <Text style={styles.dueValue}>{formatCurrency(totalDue)}</Text>
              <Text style={styles.dueHint}>Collected in cash by our delivery team.</Text>
            </View>

            <View style={styles.filterRow}>
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <Pressable
                    key={f.key}
                    onPress={() => setFilter(f.key)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {f.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          listStatus !== 'loading' ? (
            <EmptyState
              title="No bills yet"
              message="Your weekly and monthly bills will appear here once you start ordering."
            />
          ) : null
        }
        renderItem={({ item }) => {
          const balance = Math.max(0, item.totalAmount - item.paidAmount);
          return (
            <Pressable
              style={styles.billCard}
              onPress={() => navigation.navigate(CUSTOMER_ROUTES.BILL_DETAILS, { billId: item.id })}
            >
              <View style={styles.billTop}>
                <View style={styles.billPeriodBox}>
                  <Text style={styles.billPeriodType}>
                    {item.weekNumber
                      ? `Week ${item.weekNumber}`
                      : BILL_PERIOD_LABELS[item.periodType] || item.periodType}
                  </Text>
                  <Text style={styles.billPeriodRange}>
                    {formatBillPeriod(item.periodStart, item.periodEnd)}
                  </Text>
                </View>
                <Badge
                  label={BILL_STATUS_LABELS[item.status] || item.status}
                  color={BILL_STATUS_COLORS[item.status] || colors.textSecondary}
                />
              </View>

              <View style={styles.billBottom}>
                <Text style={styles.billMeta}>
                  {item.orderCount} order{item.orderCount === 1 ? '' : 's'} ·{' '}
                  {formatCurrency(item.totalAmount)}
                </Text>
                <Text style={styles.billBalance}>
                  {balance > 0 ? `${formatCurrency(balance)} due` : 'Cleared'}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: { ...typography.h2 },
  listContent: { padding: spacing.lg, paddingBottom: spacing.xl },
  dueCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  dueLabel: { ...typography.caption, color: colors.textInverse, opacity: 0.85, textTransform: 'uppercase' },
  dueValue: { ...typography.h1, color: colors.textInverse, marginTop: 2 },
  dueHint: { ...typography.caption, color: colors.textInverse, opacity: 0.85, marginTop: spacing.xs },
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: colors.textInverse },
  billCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  billTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  billPeriodBox: { flex: 1, marginRight: spacing.sm },
  billPeriodType: { ...typography.bodyBold, fontSize: 15 },
  billPeriodRange: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  billBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  billMeta: { ...typography.caption, color: colors.textSecondary },
  billBalance: { ...typography.bodyBold, color: colors.primaryDark },
});
