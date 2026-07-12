import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Input, Button } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { AUTH_ROUTES } from '../../constants/routes';
import { otpSchema } from '../../utils/validationSchemas';
import { sendOtp, verifyOtp, resetOtpFlow } from '../../redux/slices/authSlice';

export default function OtpVerifyScreen({ navigation }) {
  const dispatch = useDispatch();
  const phone = useSelector((state) => state.auth.phone);
  const verifyStatus = useSelector((state) => state.auth.verifyStatus);
  const otpStatus = useSelector((state) => state.auth.otpStatus);
  const [otp, setOtp] = useState('');
  const [formError, setFormError] = useState(null);

  const handleSubmit = async () => {
    try {
      await otpSchema.validate({ otp });
    } catch (err) {
      setFormError(err.message);
      return;
    }

    setFormError(null);
    const result = await dispatch(verifyOtp({ phone, otp: otp.trim() }));
    if (verifyOtp.fulfilled.match(result)) {
      if (!result.payload.user.isProfileComplete) {
        navigation.replace(AUTH_ROUTES.PROFILE_SETUP);
      }
      // else: RootNavigator swaps to the role's tab navigator automatically.
    } else {
      setFormError(result.payload);
    }
  };

  const handleResend = async () => {
    setFormError(null);
    const result = await dispatch(sendOtp(phone));
    if (!sendOtp.fulfilled.match(result)) {
      setFormError(result.payload);
    }
  };

  const handleChangeNumber = () => {
    dispatch(resetOtpFlow());
    navigation.navigate(AUTH_ROUTES.LOGIN);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify your number</Text>
      <Text style={styles.subtitle}>Enter the code sent to {phone}</Text>
      <Input
        label="OTP"
        placeholder="1234"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
        error={formError}
      />
      <Button
        title="Verify"
        onPress={handleSubmit}
        loading={verifyStatus === 'loading'}
        style={styles.button}
      />
      <Button
        title="Resend OTP"
        variant="ghost"
        onPress={handleResend}
        loading={otpStatus === 'loading'}
        style={styles.button}
      />
      <Button title="Change number" variant="ghost" onPress={handleChangeNumber} />
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
