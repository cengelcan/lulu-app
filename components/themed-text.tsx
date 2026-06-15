import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { DEFAULT_MAX_FONT_SIZE_MULTIPLIER, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  maxFontSizeMultiplier?: number;
};

function getTypeStyle(type: ThemedTextProps['type']): TextStyle | undefined {
  switch (type) {
    case 'default':
      return styles.default;
    case 'title':
      return styles.title;
    case 'defaultSemiBold':
      return styles.defaultSemiBold;
    case 'subtitle':
      return styles.subtitle;
    case 'link':
      return styles.link;
    default:
      return undefined;
  }
}

function getMaxFontSizeMultiplier(
  type: ThemedTextProps['type'],
  override?: number
): number {
  if (override !== undefined) {
    return override;
  }

  switch (type) {
    case 'title':
      return Typography.title.maxFontSizeMultiplier;
    case 'subtitle':
      return Typography.subtitle.maxFontSizeMultiplier;
    case 'defaultSemiBold':
      return Typography.bodySemiBold.maxFontSizeMultiplier;
    case 'link':
    case 'default':
    default:
      return DEFAULT_MAX_FONT_SIZE_MULTIPLIER;
  }
}

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  maxFontSizeMultiplier,
  allowFontScaling = true,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={getMaxFontSizeMultiplier(type, maxFontSizeMultiplier)}
      style={[{ color }, getTypeStyle(type), style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
  },
  defaultSemiBold: {
    fontSize: Typography.bodySemiBold.fontSize,
    lineHeight: Typography.bodySemiBold.lineHeight,
    fontWeight: Typography.bodySemiBold.fontWeight,
  },
  title: {
    fontSize: Typography.title.fontSize,
    fontWeight: Typography.title.fontWeight,
    lineHeight: Typography.title.lineHeight,
  },
  subtitle: {
    fontSize: Typography.subtitle.fontSize,
    fontWeight: Typography.subtitle.fontWeight,
    lineHeight: Typography.subtitle.lineHeight,
  },
  link: {
    lineHeight: 30,
    fontSize: Typography.body.fontSize,
    color: '#0a7ea4',
  },
});
