import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../components/common';
import { colors, spacing, radius, typography } from '../../theme';
import { formatAddress } from '../../utils/format';
import { logout } from '../../redux/slices/authSlice';
import { clearCart } from '../../redux/slices/cartSlice';

function Field({ label, value }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value || '—'}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          dispatch(clearCart());
          dispatch(logout());
        },
      },
    ]);
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '🙂';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.phone}>{user?.phone}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery address</Text>
          <Field label="Building / Society" value={user?.address?.building} />
          <Field label="Wing / Block" value={user?.address?.wing} />
          <Field label="Flat no." value={user?.address?.flat} />
          <Field label="Landmark" value={user?.address?.landmark} />
          <Text style={styles.addressSummary}>{formatAddress(user?.address)}</Text>
        </View>

        <Button title="Log out" variant="danger" onPress={handleLogout} style={styles.logout} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: { ...typography.h2 },
  content: { padding: spacing.lg },
  avatarBlock: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { fontSize: 34, fontWeight: '700', color: colors.textInverse },
  name: { ...typography.h2 },
  phone: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: { ...typography.h3, marginBottom: spacing.md },
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  fieldLabel: { ...typography.body, color: colors.textSecondary },
  fieldValue: { ...typography.bodyBold, flexShrink: 1, textAlign: 'right', marginLeft: spacing.md },
  addressSummary: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.md },
  logout: { marginTop: spacing.sm },
});
