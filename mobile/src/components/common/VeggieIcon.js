import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme';

// A small sprout/leaf mark built purely from Views — no image asset, no icon
// font, no SVG library. Two "leaf" shapes are just squares with three
// rounded corners and one square corner, rotated to a point; a mirrored pair
// plus a stem reads as a growing sprout.
export default function VeggieIcon({ size = 64 }) {
  const leafSize = size * 0.62;
  const stemWidth = size * 0.1;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.leaf,
          {
            width: leafSize,
            height: leafSize,
            backgroundColor: colors.primaryLight,
            bottom: size * 0.3,
            right: size * 0.06,
            borderTopLeftRadius: leafSize,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: leafSize,
            borderBottomRightRadius: leafSize,
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.leaf,
          {
            width: leafSize * 0.88,
            height: leafSize * 0.88,
            backgroundColor: colors.primary,
            bottom: size * 0.3,
            left: size * 0.06,
            borderTopLeftRadius: 0,
            borderTopRightRadius: leafSize,
            borderBottomLeftRadius: leafSize,
            borderBottomRightRadius: leafSize,
            transform: [{ rotate: '45deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.dot,
          {
            width: size * 0.14,
            height: size * 0.14,
            borderRadius: size * 0.07,
            top: size * 0.08,
            right: size * 0.16,
          },
        ]}
      />
      <View
        style={[
          styles.stem,
          {
            width: stemWidth,
            height: size * 0.32,
            borderRadius: stemWidth / 2,
            left: size / 2 - stemWidth / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaf: {
    position: 'absolute',
  },
  stem: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: colors.primaryDark,
  },
  dot: {
    position: 'absolute',
    backgroundColor: colors.accent,
  },
});
