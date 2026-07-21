import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Button, EmptyState } from '../../components/common';
import { colors, spacing, radius, typography } from '../../theme';
import { formatCurrency, formatWeight, formatAddress } from '../../utils/format';
import { CUSTOMER_TABS } from '../../constants/routes';
import {
  addToCart,
  decrementItem,
  removeItem,
  clearCart,
  selectCartItems,
  selectCartTotal,
} from '../../redux/slices/cartSlice';
import { placeOrder, fetchOrders, fetchOrderWindow } from '../../redux/slices/ordersSlice';

const STEP_GRAMS = 250;

export default function CartScreen({ navigation }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const user = useSelector((state) => state.auth.user);
  const placeStatus = useSelector((state) => state.orders.placeStatus);
  const orderWindow = useSelector((state) => state.orders.window);
  const isWindowClosed = orderWindow?.isOpen === false;

  // Refresh the cutoff status whenever the cart is opened so the button state
  // reflects the current time, not whatever was cached earlier.
  useEffect(() => {
    dispatch(fetchOrderWindow());
  }, [dispatch]);

  const handlePlaceOrder = async () => {
    if (isWindowClosed) {
      Alert.alert('Order window closed', orderWindow?.message || 'Please try again tomorrow.');
      return;
    }
    const result = await dispatch(placeOrder(items));
    if (placeOrder.fulfilled.match(result)) {
      dispatch(clearCart());
      dispatch(fetchOrders());
      Alert.alert('Order placed! 🎉', 'Your fresh veggies are on the way.', [
        { text: 'View Orders', onPress: () => navigation.navigate(CUSTOMER_TABS.ORDERS) },
      ]);
    } else {
      Alert.alert('Could not place order', result.payload || 'Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <Text style={styles.title}>Cart</Text>
        </View>
        <EmptyState
          title="Your cart is empty"
          message="Add some fresh vegetables to get started."
          actionLabel="Browse veggies"
          onAction={() => navigation.navigate(CUSTOMER_TABS.HOME)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Cart</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.addressCard}>
            <Text style={styles.addressLabel}>Delivering to</Text>
            <Text style={styles.addressName}>{user?.name}</Text>
            <Text style={styles.addressLine}>{formatAddress(user?.address)}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const lineTotal = (item.grams / 1000) * item.pricePerKg;
          return (
            <View style={styles.row}>
              <View style={styles.emojiBox}>
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.rowMeta}>
                  {formatWeight(item.grams)} · {formatCurrency(item.pricePerKg)}/kg
                </Text>
              </View>
              <View style={styles.rowRight}>
                <View style={styles.stepper}>
                  <Pressable
                    hitSlop={8}
                    onPress={() => dispatch(decrementItem({ productId: item.productId, grams: STEP_GRAMS }))}
                    style={styles.stepBtn}
                  >
                    <Text style={styles.stepSign}>–</Text>
                  </Pressable>
                  <Text style={styles.stepWeight}>{formatWeight(item.grams)}</Text>
                  <Pressable
                    hitSlop={8}
                    onPress={() =>
                      dispatch(addToCart({ product: { ...item, id: item.productId }, grams: STEP_GRAMS }))
                    }
                    style={styles.stepBtn}
                  >
                    <Text style={styles.stepSign}>+</Text>
                  </Pressable>
                </View>
                <Text style={styles.lineTotal}>{formatCurrency(lineTotal)}</Text>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <Pressable onPress={() => dispatch(clearCart())} style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear cart</Text>
          </Pressable>
        }
      />

      <View style={[styles.footer, { paddingBottom: spacing.md + insets.bottom }]}>
        {isWindowClosed ? (
          <View style={styles.closedBanner}>
            <Text style={styles.closedTitle}>🔒 Order window is closed</Text>
            <Text style={styles.closedMessage}>
              {orderWindow?.message || 'Orders are accepted only before the daily cutoff.'}
            </Text>
          </View>
        ) : null}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
        </View>
        <Button
          title={isWindowClosed ? 'Order window closed' : 'Place Order'}
          onPress={handlePlaceOrder}
          disabled={isWindowClosed}
          loading={placeStatus === 'loading'}
        />
      </View>
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
  listContent: { padding: spacing.lg, paddingBottom: spacing.md },
  addressCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressLabel: { ...typography.caption, color: colors.textSecondary, textTransform: 'uppercase' },
  addressName: { ...typography.bodyBold, fontSize: 16, marginTop: 2 },
  addressLine: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  emojiBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: `${colors.primaryLight}22`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  emoji: { fontSize: 24 },
  rowInfo: { flex: 1 },
  rowName: { ...typography.bodyBold, fontSize: 15 },
  rowMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  rowRight: { alignItems: 'flex-end' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  stepBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  stepSign: { fontSize: 20, color: colors.primary, fontWeight: '700', lineHeight: 22 },
  stepWeight: { ...typography.caption, minWidth: 48, textAlign: 'center', fontWeight: '600' },
  lineTotal: { ...typography.bodyBold, marginTop: spacing.xs, color: colors.primaryDark },
  clearBtn: { alignSelf: 'center', padding: spacing.md, marginTop: spacing.xs },
  clearText: { ...typography.body, color: colors.danger, fontWeight: '600' },
  footer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalLabel: { ...typography.h3, color: colors.textSecondary },
  totalValue: { ...typography.h2, color: colors.primaryDark },
  closedBanner: {
    backgroundColor: `${colors.danger}14`,
    borderWidth: 1,
    borderColor: `${colors.danger}55`,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  closedTitle: { ...typography.bodyBold, color: colors.danger },
  closedMessage: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
