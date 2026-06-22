import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { DEFAULT_MAX_FONT_SIZE_MULTIPLIER, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type ThemedTextType =
  | 'default'
  | 'title'
  | 'displayMd'
  | 'defaultSemiBold'
  | 'subtitle'
  | 'titleSmall'
  | 'caption'
  | 'link';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemedTextType;
  maxFontSizeMultiplier?: number;
};

function getTypeStyle(type: ThemedTextProps['type']): TextStyle | undefined {
  switch (type) {
    case 'default':
      return styles.default;
    case 'title':
      return styles.title;
    case 'displayMd':
      return styles.displayMd;
    case 'defaultSemiBold':
      return styles.defaultSemiBold;
    case 'subtitle':
      return styles.subtitle;
    case 'titleSmall':
      return styles.titleSmall;
    case 'caption':
      return styles.caption;
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
    case 'displayMd':
      return Typography.displayMd.maxFontSizeMultiplier;
    case 'title':
      return Typography.title.maxFontSizeMultiplier;
    case 'subtitle':
      return Typography.subtitle.maxFontSizeMultiplier;
    case 'titleSmall':
      return Typography.titleSmall.maxFontSizeMultiplier;
    case 'defaultSemiBold':
      return Typography.bodySemiBold.maxFontSizeMultiplier;
    case 'caption':
      return Typography.caption.maxFontSizeMultiplier;
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
  const linkColor = useThemeColor({}, 'accent');

  return (
    <Text
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={getMaxFontSizeMultiplier(type, maxFontSizeMultiplier)}
      style={[{ color: type === 'link' ? linkColor : color }, getTypeStyle(type), style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    letterSpacing: Typography.body.letterSpacing,
  },
  defaultSemiBold: {
    fontSize: Typography.bodySemiBold.fontSize,
    lineHeight: Typography.bodySemiBold.lineHeight,
    fontWeight: Typography.bodySemiBold.fontWeight,
    letterSpacing: Typography.bodySemiBold.letterSpacing,
  },
  displayMd: {
    fontSize: Typography.displayMd.fontSize,
    fontWeight: Typography.displayMd.fontWeight,
    lineHeight: Typography.displayMd.lineHeight,
    letterSpacing: Typography.displayMd.letterSpacing,
  },
  title: {
    fontSize: Typography.title.fontSize,
    fontWeight: Typography.title.fontWeight,
    lineHeight: Typography.title.lineHeight,
    letterSpacing: Typography.title.letterSpacing,
  },
  subtitle: {
    fontSize: Typography.subtitle.fontSize,
    fontWeight: Typography.subtitle.fontWeight,
    lineHeight: Typography.subtitle.lineHeight,
    letterSpacing: Typography.subtitle.letterSpacing,
  },
  titleSmall: {
    fontSize: Typography.titleSmall.fontSize,
    fontWeight: Typography.titleSmall.fontWeight,
    lineHeight: Typography.titleSmall.lineHeight,
    letterSpacing: Typography.titleSmall.letterSpacing,
  },
  caption: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    lineHeight: Typography.caption.lineHeight,
    letterSpacing: Typography.caption.letterSpacing,
  },
  link: {
    lineHeight: 24,
    fontSize: Typography.body.fontSize,
  },
});
