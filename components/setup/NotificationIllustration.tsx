import { StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandGradient } from '@/components/ui/BrandGradient';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export function NotificationIllustration() {
  const primaryTextColor = useThemeColor({}, 'primaryText');

  return (
    <View style={styles.root}>
      <BrandGradient style={styles.bellCircle}>
        <IconSymbol name="bell.fill" size={40} color={primaryTextColor} />
      </BrandGradient>
      <View style={[styles.badge, { backgroundColor: Palette.canvas }]}>
        <View style={styles.badgeInner}>
          <IconSymbol name="checkmark" size={12} color={Palette.brandGradientEnd} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellCircle: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Palette.brandAccentGlow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeInner: {
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    backgroundColor: Palette.brandAccentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
