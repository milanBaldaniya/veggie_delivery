import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import CustomerTabNavigator from './CustomerTabNavigator';
import AdminTabNavigator from './AdminTabNavigator';
import { ROLES } from '../constants/roles';
import { fetchMe } from '../redux/slices/authSlice';

// Single source of truth for "which whole navigator tree is mounted":
// the backend-issued role on the authenticated user, nothing else. A
// signed-in user with an incomplete profile stays on AuthStack (which
// resumes at ProfileSetup) until isProfileComplete flips true.
export default function RootNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const isProfileComplete = Boolean(user?.isProfileComplete);

  useEffect(() => {
    // Revalidates a persisted session on app launch — catches an
    // in-the-meantime disabled account or expired token (axiosClient's
    // interceptor transparently refreshes or logs out on 401).
    if (isAuthenticated) {
      dispatch(fetchMe());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let content = <AuthStack />;
  if (isAuthenticated && isProfileComplete && user?.role === ROLES.ADMIN) {
    content = <AdminTabNavigator />;
  } else if (isAuthenticated && isProfileComplete && user?.role === ROLES.CUSTOMER) {
    content = <CustomerTabNavigator />;
  }

  return <NavigationContainer>{content}</NavigationContainer>;
}
