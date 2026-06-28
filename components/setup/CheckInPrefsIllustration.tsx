import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const DOG_ICON = require('@/assets/images/pet-icon-dog.png');
const CAT_ICON = require('@/assets/images/pet-icon-cat.png');

export function CheckInPrefsIllustration() {
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  return (
    <View style={styles.root}>
      <Image accessibilityIgnoresInvertColors contentFit="contain" source={DOG_ICON} style={styles.dog} />
      <Image accessibilityIgnoresInvertColors contentFit="contain" source={CAT_ICON} style={styles.cat} />
      <View style={styles.heart}>
        <IconSymbol name="heart.fill" size={14} color={brandAccentColor} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: 108,
    height: 96,
    position: 'relative',
  },
  dog: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 72,
    height: 72,
  },
  cat: {
    position: 'absolute',
    right: 0,
    bottom: 4,
    width: 64,
    height: 64,
  },
  heart: {
    position: 'absolute',
    top: 4,
    right: 18,
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.brandAccentSoft,
  },
});
