import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { House, ShoppingCart, Package, Wallet, User } from 'lucide-react-native';
import HomeScreen from '../screens/customer/HomeScreen';
import CartScreen from '../screens/customer/CartScreen';
import OrdersScreen from '../screens/customer/OrdersScreen';
import BillsStack from './BillsStack';
import ProfileStack from './ProfileStack';
import { colors, spacing, radius } from '../theme';
import { CUSTOMER_TABS } from '../constants/routes';
import { selectCartProductCount } from '../redux/slices/cartSlice';

const Tab = createBottomTabNavigator();

// Categories is intentionally omitted — the shop sells vegetables only, so
// there's nothing to categorise yet. Add it back when the catalog grows.
const TAB_CONFIG = [
  { name: CUSTOMER_TABS.HOME, label: 'Home', Icon: House, component: HomeScreen },
  { name: CUSTOMER_TABS.CART, label: 'Cart', Icon: ShoppingCart, component: CartScreen },
  { name: CUSTOMER_TABS.ORDERS, label: 'Orders', Icon: Package, component: OrdersScreen },
  { name: CUSTOMER_TABS.BILLS, label: 'Bills', Icon: Wallet, component: BillsStack },
  { name: CUSTOMER_TABS.PROFILE, label: 'Profile', Icon: User, component: ProfileStack },
];

export default function CustomerTabNavigator() {
  const cartCount = useSelector(selectCartProductCount);
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: styles.label,
        tabBarStyle: [styles.tabBar, { height: 58 + insets.bottom, paddingBottom: insets.bottom || spacing.sm }],
      }}
    >
      {TAB_CONFIG.map(({ name, label, Icon, component }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={component}
          options={{
            tabBarLabel: label,
            tabBarIcon: ({ focused, color }) => (
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <Icon size={21} color={color} strokeWidth={focused ? 2.4 : 2} />
              </View>
            ),
            tabBarBadge: name === CUSTOMER_TABS.CART && cartCount > 0 ? cartCount : undefined,
            tabBarBadgeStyle: styles.badge,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    paddingTop: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  iconWrap: {
    width: 44,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  iconWrapActive: {
    backgroundColor: `${colors.primary}14`,
  },
  badge: {
    backgroundColor: colors.accent,
  },
});
