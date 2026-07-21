import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import HomeScreen from '../screens/customer/HomeScreen';
import CartScreen from '../screens/customer/CartScreen';
import OrdersScreen from '../screens/customer/OrdersScreen';
import BillsStack from './BillsStack';
import ProfileScreen from '../screens/customer/ProfileScreen';
import { colors } from '../theme';
import { CUSTOMER_TABS } from '../constants/routes';
import { selectCartProductCount } from '../redux/slices/cartSlice';

const Tab = createBottomTabNavigator();

// Categories is intentionally omitted — the shop sells vegetables only, so
// there's nothing to categorise yet. Add it back when the catalog grows.
const TAB_CONFIG = [
  { name: CUSTOMER_TABS.HOME, label: 'Home', icon: '🏠', component: HomeScreen },
  { name: CUSTOMER_TABS.CART, label: 'Cart', icon: '🛒', component: CartScreen },
  { name: CUSTOMER_TABS.ORDERS, label: 'Orders', icon: '📦', component: OrdersScreen },
  { name: CUSTOMER_TABS.BILLS, label: 'Bills', icon: '💰', component: BillsStack },
  { name: CUSTOMER_TABS.PROFILE, label: 'Profile', icon: '👤', component: ProfileScreen },
];

export default function CustomerTabNavigator() {
  const cartCount = useSelector(selectCartProductCount);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      {TAB_CONFIG.map(({ name, label, icon, component }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={component}
          options={{
            tabBarLabel: label,
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{icon}</Text>,
            tabBarBadge:
              name === CUSTOMER_TABS.CART && cartCount > 0 ? cartCount : undefined,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
