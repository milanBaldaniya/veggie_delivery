import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';
import { WEIGHT_OPTIONS, DEFAULT_WEIGHT_GRAMS } from '../../constants/weights';
import { formatCurrency, formatWeight } from '../../utils/format';

// One vegetable in the catalog. The customer picks a weight pack (chips) and
// either taps Add or uses the +/- stepper once it's in the cart — every tap
// adds/removes the currently selected pack size.
export default function VegetableCard({ product, gramsInCart, onAdd, onRemove }) {
  const [selectedGrams, setSelectedGrams] = useState(DEFAULT_WEIGHT_GRAMS);

  const inCart = gramsInCart > 0;
  const lineTotal = (gramsInCart / 1000) * product.pricePerKg;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.emojiBox}>
          <Text style={styles.emoji}>{product.emoji}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{formatCurrency(product.pricePerKg)}/kg</Text>
        </View>
        {inCart ? (
          <View style={styles.cartPill}>
            <Text style={styles.cartPillWeight}>{formatWeight(gramsInCart)}</Text>
            <Text style={styles.cartPillTotal}>{formatCurrency(lineTotal)}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.chipsRow}>
        {WEIGHT_OPTIONS.map((opt) => {
          const active = opt.grams === selectedGrams;
          return (
            <Pressable
              key={opt.grams}
              onPress={() => setSelectedGrams(opt.grams)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {inCart ? (
        <View style={styles.stepper}>
          <Pressable
            onPress={() => onRemove(selectedGrams)}
            style={styles.stepBtn}
            hitSlop={8}
          >
            <Text style={styles.stepSign}>–</Text>
          </Pressable>
          <Text style={styles.stepLabel}>
            Add / remove {WEIGHT_OPTIONS.find((o) => o.grams === selectedGrams)?.label}
          </Text>
          <Pressable onPress={() => onAdd(selectedGrams)} style={styles.stepBtn} hitSlop={8}>
            <Text style={styles.stepSign}>+</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={() => onAdd(selectedGrams)} style={styles.addBtn}>
          <Text style={styles.addText}>Add {WEIGHT_OPTIONS.find((o) => o.grams === selectedGrams)?.label}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiBox: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: `${colors.primaryLight}22`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  emoji: { fontSize: 28 },
  info: { flex: 1 },
  name: { ...typography.bodyBold, fontSize: 16 },
  price: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  cartPill: {
    backgroundColor: `${colors.primary}12`,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignItems: 'flex-end',
  },
  cartPillWeight: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  cartPillTotal: { ...typography.caption, color: colors.primaryDark, fontWeight: '700' },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  chip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}0F`,
  },
  chipText: { ...typography.bodyBold, color: colors.textSecondary },
  chipTextActive: { color: colors.primary },
  addBtn: {
    marginTop: spacing.md,
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { ...typography.button, fontSize: 15 },
  stepper: {
    marginTop: spacing.md,
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  stepBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepSign: { fontSize: 24, color: colors.primary, fontWeight: '700', lineHeight: 26 },
  stepLabel: { ...typography.caption, color: colors.primary, fontWeight: '600' },
});
