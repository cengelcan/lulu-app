import { StyleSheet, View } from 'react-native';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type FamilyHeroPlaceholderProps = {
  icon?: IconSymbolName;
  size?: number;
};

export function FamilyHeroPlaceholder({
  icon = 'person.2.fill',
  size = 160,
}: FamilyHeroPlaceholderProps) {
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');
  const surfaceColor = useThemeColor({}, 'surface');

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View style={[styles.outerRing, { backgroundColor: brandAccentSoft, borderRadius: size / 2 }]} />
      <View
        style={[
          styles.innerCircle,
          {
            width: size * 0.72,
            height: size * 0.72,
            borderRadius: (size * 0.72) / 2,
            backgroundColor: surfaceColor,
          },
        ]}>
        <IconSymbol name={icon} size={size * 0.28} color={brandAccentColor} />
      </View>
      <View style={[styles.heart, styles.heartLeft, { backgroundColor: Palette.brandAccentBorder }]} />
      <View style={[styles.heart, styles.heartRight, { backgroundColor: brandAccentSoft }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
  },
  outerRing: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  innerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.brandAccentBorder,
  },
  heart: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: Radius.full,
  },
  heartLeft: {
    top: 18,
    left: 24,
  },
  heartRight: {
    bottom: 28,
    right: 20,
  },
});
