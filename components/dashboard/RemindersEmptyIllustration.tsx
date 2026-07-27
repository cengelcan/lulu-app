import { StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type RemindersEmptyIllustrationProps = {
  size?: number;
  accentColor?: string;
  borderColor?: string;
  backgroundColor?: string;
};

const FRAME_INSET = 6;

export function RemindersEmptyIllustration({
  size = 88,
  accentColor = Palette.badgeViolet,
  borderColor,
  backgroundColor,
}: RemindersEmptyIllustrationProps) {
  const surfaceColor = useThemeColor({}, 'surface');
  const themeBorderColor = useThemeColor({}, 'border');
  const fillColor = backgroundColor ?? surfaceColor;
  const frameBorderColor = borderColor ?? themeBorderColor;
  const calendarSize = Math.round(size * 0.38);
  const badgeSize = Math.round(size * 0.22);
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
          stroke={frameBorderColor}
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
