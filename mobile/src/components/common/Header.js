import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';

export default function Header({ title, onBack, right }) {
  // headerShown is false everywhere (screens render this custom Header
  // instead), so it must account for the safe area itself: Android's
  // status bar via StatusBar.currentHeight, iOS's notch/dynamic island
  // via the safe-area inset (StatusBar.currentHeight is always 0 on iOS).
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight || 0;

  return (
    <View style={[styles.container, { paddingTop: topInset, height: 56 + topInset }]}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12}>
            <Text style={styles.backIcon}>{'‹'}</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, styles.rightSide]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  side: {
    width: 40,
    justifyContent: 'center',
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  title: {
    ...typography.h3,
    flex: 1,
    textAlign: 'center',
  },
  backIcon: {
    fontSize: 32,
    color: colors.textPrimary,
    lineHeight: 32,
  },
});
