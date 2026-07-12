import React from 'react';
import { useSelector } from 'react-redux';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OtpVerifyScreen from '../screens/auth/OtpVerifyScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';
import { AUTH_ROUTES } from '../constants/routes';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  // Resumes straight into ProfileSetup on app restart if OTP was verified
  // but the profile was never completed.
  const initialRouteName =
    isAuthenticated && !user?.isProfileComplete ? AUTH_ROUTES.PROFILE_SETUP : AUTH_ROUTES.SPLASH;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
      <Stack.Screen name={AUTH_ROUTES.SPLASH} component={SplashScreen} />
      <Stack.Screen name={AUTH_ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={AUTH_ROUTES.OTP_VERIFY} component={OtpVerifyScreen} />
      <Stack.Screen name={AUTH_ROUTES.PROFILE_SETUP} component={ProfileSetupScreen} />
    </Stack.Navigator>
  );
}
