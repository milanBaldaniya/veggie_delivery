import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export default function ListItem({ title, subtitle, left, right, onPress }) {
  // Plain View's `style` only accepts an object/array, not a function — the
  // pressed-state callback form only works when Container is Pressable.
  const Container = onPress ? Pressable : View;
  const containerStyle = onPress
    ? ({ pressed }) => [styles.container, pressed ? { backgroundColor: colors.divider } : null]
    : styles.container;

  return (
    <Container onPress={onPress} style={containerStyle}>
      {left ? <View style={styles.left}>{left}</View> : null}
      <View style={styles.content}>
        <Text style={typography.bodyBold} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text style={[typography.caption, styles.subtitle]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 56,
  },
  left: {
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
  },
  right: {
    marginLeft: spacing.sm,
  },
});
