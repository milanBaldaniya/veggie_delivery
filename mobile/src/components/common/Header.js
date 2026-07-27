import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';

export default function Header({ title, onBack, right }) {
  // headerShown is false everywhere (screens render this custom Header
  // instead), so it must account for the safe area itself. Use the
  // safe-area inset on both platforms (same source tab-root screens like
  // HomeScreen/BillsScreen already use for their own top padding) — Android's
  // StatusBar.currentHeight is unreliable on newer edge-to-edge Android
  // versions and was over-reporting the inset here, pushing this header
  // noticeably lower than every other screen in the app.
  const insets = useSafeAreaInsets();
  const topInset = insets.top;

  return (
    <View style={[styles.container, { paddingTop: topInset + spacing.md }]}>
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
    // Matches the topBar paddingVertical used by tab-root screens
    // (Cart/Orders/Bills) exactly, so back-button screens line up with them
    // pixel-for-pixel instead of sitting in a separately-sized fixed box.
    paddingBottom: spacing.md,
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
    // Matches the title size Cart/Orders/Bills use for their own topBar
    // title (typography.h2) so header weight is consistent app-wide, even
    // though those tab-root screens left-align theirs and this stays
    // centered (standard back-button header convention).
    ...typography.h2,
    flex: 1,
    textAlign: 'center',
  },
  backIcon: {
    fontSize: 32,
    color: colors.textPrimary,
    lineHeight: 32,
  },
});
