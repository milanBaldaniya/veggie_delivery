import React from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Header } from '../../components/common';
import ProfileForm from '../../components/profile/ProfileForm';
import { colors, spacing } from '../../theme';
import { updateProfile } from '../../redux/slices/authSlice';

export default function EditProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const profileStatus = useSelector((state) => state.auth.profileStatus);

  const initialValues = {
    name: user?.name || '',
    phone: user?.phone || '',
    building: user?.address?.building || '',
    wing: user?.address?.wing || '',
    flat: user?.address?.flat || '',
    landmark: user?.address?.landmark || '',
  };

  const handleSubmit = async (payload) => {
    const result = await dispatch(updateProfile(payload));
    if (!updateProfile.fulfilled.match(result)) {
      return { error: result.payload };
    }
    navigation.goBack();
    return {};
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Edit Profile" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ProfileForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          loading={profileStatus === 'loading'}
          submitLabel="Save changes"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
