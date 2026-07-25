import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/customer/ProfileScreen';
import EditProfileScreen from '../screens/customer/EditProfileScreen';
import SupportScreen from '../screens/customer/SupportScreen';
import { CUSTOMER_ROUTES } from '../constants/routes';

const Stack = createNativeStackNavigator();

// The Profile tab is a small stack so editing/support push their own full
// screens (with a back button), matching BillsStack's pattern.
export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={CUSTOMER_ROUTES.PROFILE} component={ProfileScreen} />
      <Stack.Screen name={CUSTOMER_ROUTES.EDIT_PROFILE} component={EditProfileScreen} />
      <Stack.Screen name={CUSTOMER_ROUTES.SUPPORT} component={SupportScreen} />
    </Stack.Navigator>
  );
}
