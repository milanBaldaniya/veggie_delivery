import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Loader, EmptyState } from '../../components/common';
import VegetableCard from '../../components/catalog/VegetableCard';
import { colors, spacing, radius, typography } from '../../theme';
import { formatCurrency } from '../../utils/format';
import { CUSTOMER_TABS } from '../../constants/routes';
import { fetchProducts } from '../../redux/slices/catalogSlice';
import {
  addToCart,
  decrementItem,
  selectCartProductCount,
  selectCartTotal,
} from '../../redux/slices/cartSlice';

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { products, status } = useSelector((state) => state.catalog);
  const cartItemsMap = useSelector((state) => state.cart.items);
  const cartCount = useSelector(selectCartProductCount);
  const cartTotal = useSelector(selectCartTotal);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  const renderHeader = () => (
    <View style={styles.headerBlock}>
      <Text style={styles.greeting}>Hi {firstName} 👋</Text>
      <Text style={styles.tagline}>Fresh vegetables, delivered to your door</Text>
    </View>
  );

  if (status === 'loading' && products.length === 0) {
    return <Loader />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>🥦 Veggie Delivery</Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={status === 'loading'}
            onRefresh={() => dispatch(fetchProducts())}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          status !== 'loading' ? (
            <EmptyState
              title="No vegetables yet"
              message="Pull down to refresh, or check back soon."
            />
          ) : null
        }
        renderItem={({ item }) => (
          <VegetableCard
            product={item}
            gramsInCart={cartItemsMap[item.id]?.grams || 0}
            onAdd={(grams) => dispatch(addToCart({ product: item, grams }))}
            onRemove={(grams) => dispatch(decrementItem({ productId: item.id, grams }))}
          />
        )}
      />

      {cartCount > 0 ? (
        <Pressable
          style={styles.cartBar}
          onPress={() => navigation.navigate(CUSTOMER_TABS.CART)}
        >
          <View>
            <Text style={styles.cartBarCount}>
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </Text>
            <Text style={styles.cartBarTotal}>{formatCurrency(cartTotal)}</Text>
          </View>
          <Text style={styles.cartBarCta}>View Cart →</Text>
        </Pressable>
      ) : null}
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
  brand: { ...typography.h3, color: colors.primary },
  headerBlock: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: { ...typography.h1 },
  tagline: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  cartBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cartBarCount: { ...typography.caption, color: `${colors.textInverse}CC`, fontWeight: '600' },
  cartBarTotal: { ...typography.bodyBold, color: colors.textInverse, fontSize: 18 },
  cartBarCta: { ...typography.button, color: colors.textInverse },
});
