import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { CircleAlert, ShieldCheck } from 'lucide-react-native';
import { Button, GoogleIcon, VeggieScene } from '../../components/common';
import { colors, spacing, radius, typography } from '../../theme';
import { googleLogin } from '../../redux/slices/authSlice';

export default function LoginScreen() {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const loginStatus = useSelector((state) => state.auth.loginStatus);
  const loginError = useSelector((state) => state.auth.loginError);

  const handleGoogleLogin = () => {
    // On success RootNavigator/AuthStack swap to the right screen automatically
    // (ProfileSetup if the profile is incomplete, otherwise the tab navigator).
    dispatch(googleLogin());
  };

  return (
    <View style={styles.container}>
      <View style={[styles.stage, { paddingTop: insets.top + spacing.md }]}>
        <VeggieScene width={380} />
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in with Google to get fresh veggies delivered to your door.</Text>

        <Button
          title="Continue with Google"
          variant="neutral"
          leadingIcon={<GoogleIcon size={18} />}
          onPress={handleGoogleLogin}
          loading={loginStatus === 'loading'}
          style={styles.button}
        />

        {loginError ? (
          <View style={styles.errorBanner}>
            <CircleAlert size={16} color={colors.danger} />
            <Text style={styles.errorText}>{loginError}</Text>
          </View>
        ) : (
          <View style={styles.trustRow}>
            <ShieldCheck size={14} color={colors.textSecondary} />
            <Text style={styles.trustText}>Secure sign-in, powered by Google</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.lg,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.h1,
    fontSize: 26,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  button: {
    width: '100%',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  trustText: {
    ...typography.caption,
    marginLeft: spacing.xs,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.danger}14`,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginLeft: spacing.xs,
    flexShrink: 1,
    textAlign: 'center',
  },
});
