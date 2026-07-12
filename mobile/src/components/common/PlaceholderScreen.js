import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

/**
 * Stand-in for screens not yet built in the current roadmap phase.
 * Each phase replaces its relevant PlaceholderScreen usages with the real screen.
 */
export default function PlaceholderScreen({ title, note }) {
  return (
    <View style={styles.container}>
      <Text style={typography.h2}>{title}</Text>
      <Text style={styles.note}>{note || 'This screen is built in a later phase.'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  note: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
