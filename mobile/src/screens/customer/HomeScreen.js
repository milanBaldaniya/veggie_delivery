import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X, ArrowRight } from 'lucide-react-native';
import { Loader, EmptyState, VeggieIcon } from '../../components/common';
import VegetableCard from '../../components/catalog/VegetableCard';
import { colors, spacing, radius, typography } from '../../theme';
import { formatCurrency } from '../../utils/format';
import { CUSTOMER_TABS } from '../../constants/routes';
import { fetchProducts } from '../../redux/slices/catalogSlice';
import { fetchOrderWindow } from '../../redux/slices/ordersSlice';
import {
  addToCart,
  decrementItem,
  selectCartProductCount,
  selectCartTotal,
} from '../../redux/slices/cartSlice';

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { products, status, page, hasMore, loadingMore } = useSelector((state) => state.catalog);
  const cartItemsMap = useSelector((state) => state.cart.items);
  const cartCount = useSelector(selectCartProductCount);
  const cartTotal = useSelector(selectCartTotal);
  const user = useSelector((state) => state.auth.user);
  const orderWindow = useSelector((state) => state.orders.window);
  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch(fetchOrderWindow());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced server-side search: every keystroke resets to page 1 rather
  // than filtering the in-memory list, so results reflect the full catalog
  // (including products not yet paged in) and match on backend aliases too.
  // The very first load (mount) skips the debounce so the catalog appears
  // immediately instead of waiting 400ms on an empty query.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      dispatch(fetchProducts({ page: 1, search: query }));
      return;
    }
    const timer = setTimeout(() => {
      dispatch(fetchProducts({ page: 1, search: query }));
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  const handleLoadMore = () => {
    if (loadingMore || status === 'loading' || !hasMore) return;
    dispatch(fetchProducts({ page: page + 1, search: query }));
  };

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
      {orderWindow.deliveryStartLabel ? (
        <View style={styles.topDeliveryBanner}>
          <Text style={styles.topDeliveryBannerText}>
            🚚 Delivery {orderWindow.deliveryStartLabel}–{orderWindow.deliveryEndLabel}
            <Text style={styles.topDeliveryBannerDivider}>  |  </Text>
            Order before {orderWindow.cutoffLabel}
          </Text>
        </View>
      ) : null}

      <View style={styles.topBar}>
        <View style={styles.brandIconWrap}>
          <VeggieIcon size={20} />
        </View>
        <Text style={styles.brand}>Veggie Delivery</Text>
      </View>

      <View style={styles.searchBar}>
        <Search size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search vegetables..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <X size={18} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={status === 'loading'}
            onRefresh={() => dispatch(fetchProducts({ page: 1, search: query }))}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          status !== 'loading' ? (
            <EmptyState
              title={query ? 'No matches found' : 'No vegetables yet'}
              message={
                query
                  ? `Nothing matches "${query}". Try a different search.`
                  : 'Pull down to refresh, or check back soon.'
              }
            />
          ) : null
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={colors.primary} />
            </View>
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
          <View style={styles.cartBarCtaRow}>
            <Text style={styles.cartBarCta}>View Cart</Text>
            <ArrowRight size={16} color={colors.textInverse} style={styles.cartBarCtaIcon} />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  brandIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}14`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  brand: { ...typography.h3, color: colors.primary },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.body,
    padding: 0,
  },
  headerBlock: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: { ...typography.h1 },
  tagline: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  topDeliveryBanner: {
    backgroundColor: `${colors.primary}14`,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  topDeliveryBannerText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '600',
    textAlign: 'center',
  },
  topDeliveryBannerDivider: { color: colors.textSecondary, fontWeight: '400' },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
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
  cartBarCtaRow: { flexDirection: 'row', alignItems: 'center' },
  cartBarCta: { ...typography.button, color: colors.textInverse },
  cartBarCtaIcon: { marginLeft: spacing.xs },
});
