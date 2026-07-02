import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const WEIGHT_SCALE_ICON = require('@/assets/images/weight-scale-icon.png');
const FRAME_INSET = 6;

type WeightEmptyIllustrationProps = {
  size?: number;
  accentColor?: string;
  borderColor?: string;
  backgroundColor?: string;
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
  backgroundColor,
}: WeightEmptyIllustrationProps) {
  const surfaceColor = useThemeColor({}, 'surface');
  const fillColor = backgroundColor ?? surfaceColor;
  const iconSize = Math.round(size * 0.4);
  const frameSize = size - FRAME_INSET * 2;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Rect
          x={FRAME_INSET}
          y={FRAME_INSET}
          width={frameSize}
          height={frameSize}
          rx={Radius.lg}
          ry={Radius.lg}
          fill={fillColor}
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
