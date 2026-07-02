import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/theme';

const WEIGHT_SCALE_ICON = require('@/assets/images/weight-scale-icon.png');

type WeightEmptyIllustrationProps = {
  size?: number;
  accentColor?: string;
  borderColor?: string;
};

export function WeightScaleIcon({
  size = 32,
  color = Palette.badgeViolet,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Image
      accessibilityIgnoresInvertColors
      contentFit="contain"
      source={WEIGHT_SCALE_ICON}
      style={{ width: size, height: size, tintColor: color }}
    />
  );
}

export function WeightEmptyIllustration({
  size = 88,
  accentColor = Palette.badgeViolet,
  borderColor = 'rgba(161, 161, 170, 0.45)',
}: WeightEmptyIllustrationProps) {
  const iconSize = Math.round(size * 0.4);

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 6}
          stroke={borderColor}
          strokeWidth="1.5"
          strokeDasharray="5 5"
        />
      </Svg>

      <WeightScaleIcon size={iconSize} color={accentColor} />

      <IconSymbol
        name="sparkles"
        size={10}
        color={accentColor}
        style={[styles.sparkle, styles.sparkleTopLeft]}
      />
      <IconSymbol
        name="sparkles"
        size={8}
        color={accentColor}
        style={[styles.sparkle, styles.sparkleTopRight]}
      />
      <IconSymbol
        name="sparkles"
        size={7}
        color={accentColor}
        style={[styles.sparkle, styles.sparkleBottomLeft]}
      />
      <IconSymbol
        name="sparkles"
        size={9}
        color={accentColor}
        style={[styles.sparkle, styles.sparkleBottomRight]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleTopLeft: {
    top: 14,
    left: 16,
  },
  sparkleTopRight: {
    top: 18,
    right: 14,
  },
  sparkleBottomLeft: {
    bottom: 16,
    left: 12,
  },
  sparkleBottomRight: {
    bottom: 14,
    right: 16,
  },
});
