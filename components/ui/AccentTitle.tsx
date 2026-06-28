import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { Palette, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type AccentTitleProps = {
  prefix: string;
  accent: string;
  suffix?: string;
  accentVariant?: 'solid' | 'gradient';
  style?: StyleProp<TextStyle>;
};

export function AccentTitle({
  prefix,
  accent,
  suffix = '',
  accentVariant = 'solid',
  style,
}: AccentTitleProps) {
  const textColor = useThemeColor({}, 'text');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const accentColor = accentVariant === 'gradient' ? Palette.brandGradientStart : brandAccentColor;

  return (
    <Text accessibilityRole="header" allowFontScaling maxFontSizeMultiplier={1.35} style={[styles.title, { color: textColor }, style]}>
      {prefix}
      <Text style={[styles.title, styles.accent, { color: accentColor }]}>{accent}</Text>
      {suffix}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.title,
  },
  accent: {
    fontWeight: '600',
  },
});
