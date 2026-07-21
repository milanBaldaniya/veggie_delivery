import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Input, Button } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { profileSetupSchema } from '../../utils/validationSchemas';
import { updateProfile } from '../../redux/slices/authSlice';

// Collects the name AND delivery address up front so that ordering later never
// has to ask for an address again — the vendor delivers off what's captured here.
export default function ProfileSetupScreen() {
  const dispatch = useDispatch();
  const profileStatus = useSelector((state) => state.auth.profileStatus);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    building: '',
    wing: '',
    flat: '',
    landmark: '',
  });
  const [errors, setErrors] = useState({});

  const setField = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    try {
      await profileSetupSchema.validate(form, { abortEarly: false });
    } catch (err) {
      const fieldErrors = {};
      (err.inner || []).forEach((e) => {
        if (e.path && !fieldErrors[e.path]) fieldErrors[e.path] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    const result = await dispatch(
      updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: {
          building: form.building.trim(),
          wing: form.wing.trim(),
          flat: form.flat.trim(),
          landmark: form.landmark.trim(),
        },
      })
    );
    if (!updateProfile.fulfilled.match(result)) {
      setErrors({ form: result.payload });
    }
    // On success RootNavigator swaps to the role's tab navigator automatically.
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

        <Input
          label="Full name"
          placeholder="e.g. Priya Sharma"
          value={form.name}
          onChangeText={setField('name')}
          error={errors.name}
        />

        <Input
          label="Phone number"
          placeholder="e.g. 9876543210"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={setField('phone')}
          error={errors.phone}
        />

        <Text style={styles.sectionLabel}>Delivery address</Text>

        <Input
          label="Building / Society"
          placeholder="e.g. Green Valley Apartments"
          value={form.building}
          onChangeText={setField('building')}
          error={errors.building}
        />
        <View style={styles.row}>
          <Input
            label="Wing / Block"
            placeholder="e.g. A"
            value={form.wing}
            onChangeText={setField('wing')}
            error={errors.wing}
            containerStyle={styles.rowItem}
          />
          <Input
            label="Flat no."
            placeholder="e.g. 302"
            value={form.flat}
            onChangeText={setField('flat')}
            error={errors.flat}
            containerStyle={styles.rowItem}
          />
        </View>
        <Input
          label="Landmark (optional)"
          placeholder="e.g. Near the clubhouse"
          value={form.landmark}
          onChangeText={setField('landmark')}
          error={errors.landmark}
        />

        {errors.form ? <Text style={styles.formError}>{errors.form}</Text> : null}

        <Button
          title="Continue"
          onPress={handleSubmit}
          loading={profileStatus === 'loading'}
          style={styles.button}
        />
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
  sectionLabel: {
    ...typography.h3,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowItem: {
    flex: 1,
  },
  formError: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.sm,
  },
});
