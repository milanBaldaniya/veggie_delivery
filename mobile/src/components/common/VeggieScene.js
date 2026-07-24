import React from 'react';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { colors } from '../../theme';

// A small flat-illustration produce scene — tomato, carrot, and a leafy
// cluster — built entirely from SVG primitives (no image assets). Used as
// the dominant visual on the login screen.
export default function VeggieScene({ width = 260 }) {
  const height = width * 0.82;

  return (
    <Svg width={width} height={height} viewBox="0 0 260 214">
      {/* soft backdrop disc */}
      <Circle cx="130" cy="107" r="104" fill={`${colors.primary}12`} />

      {/* leafy cluster, back-left */}
      <Circle cx="66" cy="120" r="30" fill={colors.primaryLight} opacity={0.9} />
      <Circle cx="44" cy="102" r="22" fill={colors.primary} opacity={0.9} />
      <Circle cx="80" cy="92" r="20" fill={colors.primaryLight} opacity={0.85} />

      {/* carrot, back-right */}
      <Path
        d="M186 30
           C204 30 213 44 211 62
           C209 84 200 112 187 148
           C174 112 165 84 163 62
           C161 44 168 30 186 30 Z"
        fill={colors.accent}
      />
      <Path d="M186 30 L186 6" stroke={colors.primary} strokeWidth={5} strokeLinecap="round" />
      <Path d="M186 14 L170 -2" stroke={colors.primary} strokeWidth={5} strokeLinecap="round" />
      <Path d="M186 14 L202 -2" stroke={colors.primaryLight} strokeWidth={5} strokeLinecap="round" />
      <Path
        d="M170 70 L202 70 M168 90 L204 90 M172 110 L200 110"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth={3}
        strokeLinecap="round"
      />

      {/* tomato, front and center */}
      <Circle cx="118" cy="140" r="52" fill={colors.danger} />
      <Ellipse cx="100" cy="122" rx="16" ry="10" fill="#FFFFFF" opacity={0.18} />
      <Path d="M118 88 C108 78 100 80 96 72 C108 74 114 80 118 88 Z" fill={colors.primary} />
      <Path d="M118 88 C128 78 136 80 140 72 C128 74 122 80 118 88 Z" fill={colors.primaryLight} />
      <Circle cx="118" cy="86" r="7" fill={colors.primary} />
    </Svg>
  );
}
