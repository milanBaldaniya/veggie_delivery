import React, { forwardRef } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';

// `onPress` turns this into a read-only "select field" that looks like a
// text input but opens a picker instead of the keyboard (e.g. building
// picker) — same label/border/error styling as a normal Input so the two
// are visually interchangeable in a form.
const Input = forwardRef(function Input(
  { label, error, containerStyle, style, onPress, rightIcon, ...textInputProps },
  ref
) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Wrapper
        onPress={onPress}
        style={[styles.inputWrap, error ? styles.inputError : null, style]}
      >
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.textSecondary}
          editable={!onPress}
          pointerEvents={onPress ? 'none' : 'auto'}
          {...textInputProps}
        />
        {rightIcon}
      </Wrapper>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodyBold,
    marginBottom: spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    padding: 0,
    ...typography.body,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});

export default Input;
