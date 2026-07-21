import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BillsScreen from '../screens/customer/BillsScreen';
import BillDetailsScreen from '../screens/customer/BillDetailsScreen';
import { CUSTOMER_ROUTES } from '../constants/routes';

const Stack = createNativeStackNavigator();

// The Bills tab is a small stack so a bill card can push its details screen.
export default function BillsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={CUSTOMER_ROUTES.WEEKLY_BILLS} component={BillsScreen} />
      <Stack.Screen name={CUSTOMER_ROUTES.BILL_DETAILS} component={BillDetailsScreen} />
    </Stack.Navigator>
  );
}
