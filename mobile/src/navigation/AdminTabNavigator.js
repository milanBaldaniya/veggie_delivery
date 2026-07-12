import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PlaceholderScreen } from '../components/common';
import { colors } from '../theme';
import { ADMIN_TABS } from '../constants/routes';

const Tab = createBottomTabNavigator();

const TAB_CONFIG = [
  { name: ADMIN_TABS.DASHBOARD, label: 'Dashboard', icon: '📊', title: 'Dashboard' },
  { name: ADMIN_TABS.ORDERS, label: 'Orders', icon: '📦', title: 'Orders' },
  { name: ADMIN_TABS.PRODUCTS, label: 'Products', icon: '🥕', title: 'Products' },
  { name: ADMIN_TABS.CUSTOMERS, label: 'Customers', icon: '👥', title: 'Customers' },
  { name: ADMIN_TABS.MORE, label: 'More', icon: '⚙️', title: 'More' },
];

// Each tab's real screen is filled in by its respective roadmap phase;
// this wires the tab shell so the app runs end-to-end today.
export default function AdminTabNavigator() {
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
