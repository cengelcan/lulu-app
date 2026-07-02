import { Image } from 'expo-image';
import type { StyleProp, ViewStyle } from 'react-native';

const LULU_LOGO = require('@/assets/brand/lulu-logo.png');

type LuluLogoProps = {
  size: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function LuluLogo({ size, accessibilityLabel, style }: LuluLogoProps) {
  return (
    <Image
      accessibilityLabel={accessibilityLabel}
      source={LULU_LOGO}
      style={[{ width: size, height: size }, style]}
      contentFit="contain"
    />
  );
}
