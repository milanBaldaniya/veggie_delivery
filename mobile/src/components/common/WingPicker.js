import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import Modal from './Modal';
import ListItem from './ListItem';
import { colors, spacing, typography } from '../../theme';

// Bottom-sheet dropdown for picking a wing/block from the selected building's
// admin-defined list (Building.wings). No search bar — these lists are short
// (a handful of wings per building), unlike the building directory itself.
export default function WingPicker({ visible, onClose, options, value, onSelect }) {
  const handleSelect = (wing) => {
    onSelect(wing);
    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <Text style={styles.title}>Select wing / block</Text>
      {options.map((w) => (
        <ListItem
          key={w}
          title={w}
          onPress={() => handleSelect(w)}
          right={value === w ? <Check size={18} color={colors.primary} /> : null}
        />
      ))}
    </Modal>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h3, marginBottom: spacing.sm },
});
