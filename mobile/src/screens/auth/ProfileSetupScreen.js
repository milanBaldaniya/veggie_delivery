import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Input, Button } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { profileSetupSchema } from '../../utils/validationSchemas';
import { updateProfile } from '../../redux/slices/authSlice';

// Building/Wing/Flat picker is added in the Buildings/Wings/Flats phase;
// for now this only collects the name needed to complete the profile.
export default function ProfileSetupScreen() {
  const dispatch = useDispatch();
  const profileStatus = useSelector((state) => state.auth.profileStatus);
  const [name, setName] = useState('');
  const [formError, setFormError] = useState(null);

  const handleSubmit = async () => {
    try {
      await profileSetupSchema.validate({ name });
    } catch (err) {
      setFormError(err.message);
      return;
    }

    setFormError(null);
    const result = await dispatch(updateProfile({ name: name.trim() }));
    if (!updateProfile.fulfilled.match(result)) {
      setFormError(result.payload);
    }
    // On success RootNavigator swaps to the role's tab navigator automatically.
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tell us about you</Text>
      <Text style={styles.subtitle}>Just your name for now — we'll ask for your address next.</Text>
      <Input
        label="Full name"
        placeholder="e.g. Priya Sharma"
        value={name}
        onChangeText={setName}
        error={formError}
      />
      <Button
        title="Continue"
        onPress={handleSubmit}
        loading={profileStatus === 'loading'}
        style={styles.button}
      />
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
});
