import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/theme';

type RemindersEmptyIllustrationProps = {
  size?: number;
  accentColor?: string;
  borderColor?: string;
};

export function RemindersEmptyIllustration({
  size = 88,
  accentColor = Palette.badgeViolet,
  borderColor = 'rgba(161, 161, 170, 0.45)',
}: RemindersEmptyIllustrationProps) {
  const calendarSize = Math.round(size * 0.38);
  const badgeSize = Math.round(size * 0.22);

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

      <IconSymbol name="calendar" size={calendarSize} color={accentColor} />

      <View style={[styles.checkBadge, { width: badgeSize, height: badgeSize }]}>
        <IconSymbol name="checkmark.circle" size={badgeSize} color={accentColor} />
      </View>

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
  checkBadge: {
    position: 'absolute',
    bottom: 18,
    right: 14,
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
