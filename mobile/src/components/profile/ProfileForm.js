import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown } from 'lucide-react-native';
import { Input, Button, BuildingPicker, WingPicker } from '../common';
import { colors, spacing, typography } from '../../theme';
import { profileSetupSchema } from '../../utils/validationSchemas';
import { fetchBuildings } from '../../redux/slices/buildingsSlice';

// Shared by ProfileSetupScreen (onboarding) and EditProfileScreen (later
// edits) — same fields, same validation, same submit shape. `onSubmit`
// receives the { name, phone, address } payload and should return
// `{ error }` on failure (or nothing/`{}` on success) rather than throwing,
// so this form can show the error inline without knowing which screen it's
// wired into.
export default function ProfileForm({ initialValues, onSubmit, submitLabel = 'Continue', loading }) {
  const dispatch = useDispatch();
  const buildingsList = useSelector((state) => state.buildings.buildings);
  const [form, setForm] = useState({
    name: initialValues?.name || '',
    phone: initialValues?.phone || '',
    building: initialValues?.building || '',
    wing: initialValues?.wing || '',
    flat: initialValues?.flat || '',
    landmark: initialValues?.landmark || '',
  });
  const [errors, setErrors] = useState({});
  const [buildingPickerVisible, setBuildingPickerVisible] = useState(false);
  const [wingPickerVisible, setWingPickerVisible] = useState(false);

  // Warm the buildings list with the already-saved building (edit-profile
  // case) so its `wings` are available for the dropdown below without the
  // user having to reopen the building picker first.
  useEffect(() => {
    if (initialValues?.building) {
      dispatch(fetchBuildings({ search: initialValues.building }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // BuildingPicker's modal fetches buildings into this same redux slice and
  // closes immediately on selection without fetching again, so the picked
  // building's `wings` are still in `buildingsList` right after selection.
  const selectedBuilding = buildingsList.find(
    (b) => b.name.trim().toLowerCase() === form.building.trim().toLowerCase()
  );
  const wingOptions = selectedBuilding?.wings || [];

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
    const result = await onSubmit({
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: {
        building: form.building.trim(),
        wing: form.wing.trim(),
        flat: form.flat.trim(),
        landmark: form.landmark.trim(),
      },
    });
    if (result?.error) {
      setErrors({ form: result.error });
    }
  };

  return (
    <>
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
        placeholder="Tap to search your building"
        value={form.building}
        error={errors.building}
        onPress={() => setBuildingPickerVisible(true)}
        rightIcon={<ChevronDown size={18} color={colors.textSecondary} />}
      />
      <BuildingPicker
        visible={buildingPickerVisible}
        onClose={() => setBuildingPickerVisible(false)}
        value={form.building}
        onSelect={(name) => setForm((prev) => ({ ...prev, building: name, wing: '' }))}
      />
      <View style={styles.row}>
        {wingOptions.length > 0 ? (
          <>
            <Input
              label="Wing / Block"
              placeholder="Tap to select"
              value={form.wing}
              error={errors.wing}
              onPress={() => setWingPickerVisible(true)}
              rightIcon={<ChevronDown size={18} color={colors.textSecondary} />}
              containerStyle={styles.rowItem}
            />
            <WingPicker
              visible={wingPickerVisible}
              onClose={() => setWingPickerVisible(false)}
              options={wingOptions}
              value={form.wing}
              onSelect={setField('wing')}
            />
          </>
        ) : (
          <Input
            label="Wing / Block"
            placeholder="e.g. A"
            value={form.wing}
            onChangeText={setField('wing')}
            error={errors.wing}
            containerStyle={styles.rowItem}
          />
        )}
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

      <Button title={submitLabel} onPress={handleSubmit} loading={loading} style={styles.button} />
    </>
  );
}

const styles = StyleSheet.create({
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
