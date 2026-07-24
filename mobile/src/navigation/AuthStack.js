import React from 'react';
import { useSelector } from 'react-redux';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';
import { AUTH_ROUTES } from '../constants/routes';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // `initialRouteName` only applies at mount time — it can't react to a
  // mid-session login, so which *screens exist* has to change instead of
  // just which one is "initial". React Navigation swaps the whole stack
  // (and navigates automatically) whenever the screen list itself changes,
  // which is what actually reacts to isAuthenticated flipping true right
  // after a successful Google sign-in.
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name={AUTH_ROUTES.PROFILE_SETUP} component={ProfileSetupScreen} />
      ) : (
        <>
          <Stack.Screen name={AUTH_ROUTES.SPLASH} component={SplashScreen} />
          <Stack.Screen name={AUTH_ROUTES.LOGIN} component={LoginScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
