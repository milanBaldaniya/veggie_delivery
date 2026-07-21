import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { googleLogin } from '../../redux/slices/authSlice';

export default function LoginScreen() {
  const dispatch = useDispatch();
  const loginStatus = useSelector((state) => state.auth.loginStatus);
  const loginError = useSelector((state) => state.auth.loginError);

  const handleGoogleLogin = () => {
    // On success RootNavigator/AuthStack swap to the right screen automatically
    // (ProfileSetup if the profile is incomplete, otherwise the tab navigator).
    dispatch(googleLogin());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log in</Text>
      <Text style={styles.subtitle}>Continue with your Google account to get fresh veggies delivered.</Text>

      <Button
        title="Continue with Google"
        onPress={handleGoogleLogin}
        loading={loginStatus === 'loading'}
        style={styles.button}
      />

      {loginError ? <Text style={styles.error}>{loginError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.sm,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
