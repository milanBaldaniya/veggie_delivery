import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Input, Button } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { AUTH_ROUTES } from '../../constants/routes';
import { loginSchema } from '../../utils/validationSchemas';
import { sendOtp } from '../../redux/slices/authSlice';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const otpStatus = useSelector((state) => state.auth.otpStatus);
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState(null);

  const handleSubmit = async () => {
    try {
      await loginSchema.validate({ phone });
    } catch (err) {
      setFormError(err.message);
      return;
    }

    setFormError(null);
    const result = await dispatch(sendOtp(phone.trim()));
    if (sendOtp.fulfilled.match(result)) {
      navigation.navigate(AUTH_ROUTES.OTP_VERIFY);
    } else {
      setFormError(result.payload);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log in</Text>
      <Text style={styles.subtitle}>We'll send you a one-time code to verify your number.</Text>
      <Input
        label="Phone number"
        placeholder="e.g. 9876543210"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        error={formError}
      />
      <Button
        title="Send OTP"
        onPress={handleSubmit}
        loading={otpStatus === 'loading'}
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
