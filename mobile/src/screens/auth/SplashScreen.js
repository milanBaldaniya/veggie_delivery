import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { AUTH_ROUTES } from '../../constants/routes';

export default function SplashScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <Text style={styles.logo}>🥦</Text>
        <Text style={styles.title}>Veggie Delivery</Text>
        <Text style={styles.subtitle}>Fresh vegetables, delivered to your door</Text>
      </View>
      <Button
        title="Get Started"
        variant="light"
        onPress={() => navigation.navigate(AUTH_ROUTES.LOGIN)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'space-between',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  brand: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.textInverse,
  },
  subtitle: {
    ...typography.body,
    color: colors.textInverse,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
