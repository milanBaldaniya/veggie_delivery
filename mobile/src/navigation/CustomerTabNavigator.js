import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PlaceholderScreen } from '../components/common';
import { colors } from '../theme';
import { CUSTOMER_TABS } from '../constants/routes';

const Tab = createBottomTabNavigator();

const TAB_CONFIG = [
  { name: CUSTOMER_TABS.HOME, label: 'Home', icon: '🏠', title: 'Home' },
  { name: CUSTOMER_TABS.CATEGORIES, label: 'Categories', icon: '🥕', title: 'Categories' },
  { name: CUSTOMER_TABS.CART, label: 'Cart', icon: '🛒', title: 'Cart' },
  { name: CUSTOMER_TABS.ORDERS, label: 'Orders', icon: '📦', title: 'My Orders' },
  { name: CUSTOMER_TABS.PROFILE, label: 'Profile', icon: '👤', title: 'Profile' },
];

// Each tab's real screen is filled in by its respective roadmap phase;
// this wires the tab shell so the app runs end-to-end today.
export default function CustomerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      {TAB_CONFIG.map(({ name, label, icon, title }) => (
        <Tab.Screen
          key={name}
          name={name}
          options={{
            tabBarLabel: label,
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{icon}</Text>,
          }}
        >
          {() => <PlaceholderScreen title={title} />}
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  );
}
