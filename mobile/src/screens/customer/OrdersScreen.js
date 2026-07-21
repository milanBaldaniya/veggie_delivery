import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Loader, EmptyState, Badge } from '../../components/common';
import { colors, spacing, radius, typography } from '../../theme';
import { formatCurrency, formatWeight } from '../../utils/format';
import { ORDER_STATUS_LABELS } from '../../constants/orderStatus';
import { CUSTOMER_TABS } from '../../constants/routes';
import { fetchOrders } from '../../redux/slices/ordersSlice';

const STATUS_COLORS = {
  PENDING: colors.statusPending,
  CONFIRMED: colors.statusAccepted,
  PACKED: colors.statusPacked,
  OUT_FOR_DELIVERY: colors.info,
  DELIVERED: colors.statusDelivered,
  CANCELLED: colors.statusCancelled,
};

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function OrdersScreen({ navigation }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { list, listStatus } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  if (listStatus === 'loading' && list.length === 0) {
    return <Loader />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={listStatus === 'loading'}
            onRefresh={() => dispatch(fetchOrders())}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          listStatus !== 'loading' ? (
            <EmptyState
              title="No orders yet"
              message="Your placed orders will show up here."
              actionLabel="Start shopping"
              onAction={() => navigation.navigate(CUSTOMER_TABS.HOME)}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View>
                <Text style={styles.orderId}>Order #{item.id.slice(-6).toUpperCase()}</Text>
                <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
              </View>
              <Badge
                label={ORDER_STATUS_LABELS[item.status] || item.status}
                color={STATUS_COLORS[item.status] || colors.textSecondary}
              />
            </View>

            <View style={styles.divider} />

            {item.items.map((line) => (
              <View key={line.productId} style={styles.line}>
                <Text style={styles.lineName}>
                  {line.emoji} {line.name}
                </Text>
                <Text style={styles.lineMeta}>
                  {formatWeight(line.grams)} · {formatCurrency(line.lineTotal)}
                </Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.cardFoot}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(item.totalAmount)}</Text>
            </View>
          </View>
        )}
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
  listContent: { padding: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: { ...typography.bodyBold, fontSize: 15 },
  orderDate: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  lineName: { ...typography.body, flex: 1 },
  lineMeta: { ...typography.caption, color: colors.textSecondary },
  cardFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { ...typography.bodyBold, color: colors.textSecondary },
  totalValue: { ...typography.h3, color: colors.primaryDark },
});
