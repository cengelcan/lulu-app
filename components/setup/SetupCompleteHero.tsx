import { StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const SPARKLE_POSITIONS = [
  { top: 8, left: 24, color: Palette.badgeOrange, size: 14 },
  { top: 20, right: 18, color: Palette.badgeViolet, size: 12 },
  { bottom: 16, left: 12, color: Palette.brandAccentLight, size: 10 },
  { bottom: 8, right: 28, color: Palette.badgeEmerald, size: 12 },
] as const;

export function SetupCompleteHero() {
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');
  const brandAccentBorder = useThemeColor({}, 'brandAccentBorder');
  const brandAccentGlow = useThemeColor({}, 'brandAccentGlow');

  return (
    <View style={styles.container}>
      {SPARKLE_POSITIONS.map((sparkle, index) => (
        <View
          key={index}
          style={[
            styles.sparkle,
            {
              top: 'top' in sparkle ? sparkle.top : undefined,
              bottom: 'bottom' in sparkle ? sparkle.bottom : undefined,
              left: 'left' in sparkle ? sparkle.left : undefined,
              right: 'right' in sparkle ? sparkle.right : undefined,
            },
          ]}>
          <IconSymbol name="sparkles" size={sparkle.size} color={sparkle.color} />
        </View>
      ))}

      <View
        style={[
          styles.heartHalo,
          {
            backgroundColor: brandAccentSoft,
            borderColor: brandAccentBorder,
            shadowColor: brandAccentGlow,
          },
        ]}>
        <View style={[styles.heartCircle, { backgroundColor: brandAccentSoft }]}>
          <IconSymbol name="heart.fill" size={52} color={brandAccentColor} />
          <View style={styles.pawOverlay}>
            <IconSymbol name="pawprint.fill" size={22} color={brandAccentColor} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    marginBottom: Spacing.sm,
  },
  sparkle: {
    position: 'absolute',
  },
  heartHalo: {
    borderRadius: Radius.full,
    borderWidth: 1,
    padding: Spacing.md,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
    elevation: 8,
  },
  heartCircle: {
    width: 112,
    height: 112,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pawOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 38,
  },
});
