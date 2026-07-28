import { Image, type ImageStyle } from 'expo-image';
import type { StyleProp } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

const LULU_LOGO_DARK = require('@/assets/brand/lulu-logo.png');
const LULU_LOGO_LIGHT = require('@/assets/images/lulu-logo-splash-light-v2.png');

type LuluLogoProps = {
  size: number;
  accessibilityLabel?: string;
  colorSchemeOverride?: 'light' | 'dark';
  style?: StyleProp<ImageStyle>;
};

export function LuluLogo({
  size,
  accessibilityLabel,
  colorSchemeOverride,
  style,
}: LuluLogoProps) {
  const appColorScheme = useColorScheme();
  const colorScheme = colorSchemeOverride ?? appColorScheme;

  return (
    <Image
      accessibilityLabel={accessibilityLabel}
      accessibilityIgnoresInvertColors
      source={colorScheme === 'light' ? LULU_LOGO_LIGHT : LULU_LOGO_DARK}
      style={[{ width: size, height: size }, style]}
      contentFit="contain"
    />
  );
}
