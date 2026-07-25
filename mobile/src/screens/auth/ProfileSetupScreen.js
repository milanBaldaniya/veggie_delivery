import React from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ProfileForm from '../../components/profile/ProfileForm';
import { colors, spacing, typography } from '../../theme';
import { updateProfile } from '../../redux/slices/authSlice';

// Collects the name AND delivery address up front so that ordering later never
// has to ask for an address again — the vendor delivers off what's captured here.
export default function ProfileSetupScreen() {
  const dispatch = useDispatch();
  const profileStatus = useSelector((state) => state.auth.profileStatus);

  const handleSubmit = async (payload) => {
    const result = await dispatch(updateProfile(payload));
    if (!updateProfile.fulfilled.match(result)) {
      return { error: result.payload };
    }
    // On success RootNavigator swaps to the role's tab navigator automatically.
    return {};
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Tell us about you</Text>
        <Text style={styles.subtitle}>
          We'll deliver fresh veggies right to your door — so we need your name and address.
        </Text>

        <ProfileForm onSubmit={handleSubmit} loading={profileStatus === 'loading'} submitLabel="Continue" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
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
});
