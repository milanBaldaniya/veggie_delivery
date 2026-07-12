import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';

const VARIANT_STYLES = {
  primary: { backgroundColor: colors.primary, textColor: colors.textInverse },
  outline: { backgroundColor: 'transparent', textColor: colors.primary, borderColor: colors.primary },
  danger: { backgroundColor: colors.danger, textColor: colors.textInverse },
  ghost: { backgroundColor: 'transparent', textColor: colors.primary },
  // For use on colored (e.g. primary-tinted) backgrounds where a solid primary button would blend in.
  light: { backgroundColor: colors.surface, textColor: colors.primary },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  testID,
}) {
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor || 'transparent',
          borderWidth: variantStyle.borderColor ? 1 : 0,
          opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.textColor} />
      ) : (
        <Text style={[typography.button, { color: variantStyle.textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
});
