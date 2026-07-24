import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Truck, Leaf, IndianRupee, ArrowRight } from 'lucide-react-native';
import { Button, VeggieIcon } from '../../components/common';
import { colors, spacing, radius, typography } from '../../theme';
import { AUTH_ROUTES } from '../../constants/routes';

const HIGHLIGHTS = [
  { Icon: Truck, color: colors.primary, label: 'Fast delivery' },
  { Icon: Leaf, color: colors.primaryLight, label: 'Farm fresh' },
  { Icon: IndianRupee, color: colors.accent, label: 'Best prices' },
];

export default function SplashScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.hero, { paddingTop: insets.top + spacing.xl }]}>
        <View style={styles.glow} />
        <View style={styles.logoBadge}>
          <VeggieIcon size={56} />
        </View>
        <Text style={styles.title}>Veggie Delivery</Text>
        <Text style={styles.subtitle}>Fresh vegetables, delivered to your door</Text>
      </View>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.highlightRow}>
          {HIGHLIGHTS.map(({ Icon, color, label }) => (
            <View key={label} style={styles.highlight}>
              <View style={[styles.highlightIconWrap, { backgroundColor: `${color}1A` }]}>
                <Icon size={22} color={color} strokeWidth={2.25} />
              </View>
              <Text style={styles.highlightLabel}>{label}</Text>
            </View>
          ))}
        </View>
        <Button
          title="Get Started"
          icon={ArrowRight}
          onPress={() => navigation.navigate(AUTH_ROUTES.LOGIN)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: '18%',
    width: 320,
    height: 320,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  logoBadge: {
    width: 108,
    height: 108,
    borderRadius: 32,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    ...typography.h1,
    fontSize: 32,
    letterSpacing: 0.3,
    color: colors.textInverse,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg * 1.5,
    borderTopRightRadius: radius.lg * 1.5,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  highlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  highlight: {
    flex: 1,
    alignItems: 'center',
  },
  highlightIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  highlightLabel: {
    ...typography.caption,
    textAlign: 'center',
  },
});
