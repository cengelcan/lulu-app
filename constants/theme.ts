import { Platform } from 'react-native';

export { BrandGradientTokens, Colors, Palette, type ThemeColor } from './theme-colors';

/**
 * Design tokens — Cal.com-inspired monochrome system (see design.md).
 *
 * Light surface is white canvas (#ffffff) with black primary CTAs (#111111)
 * and light-gray cards (#f5f5f5). The dark theme is derived from design.md's
 * dark surfaces (#101010 / #1a1a1a) so the app keeps full Dark Mode support.
 * Fonts stay on the native system stack (SF Pro on iOS); the display voice is
 * carried by weight 600 + negative letter-spacing, per design.md's Inter/Cal
 * Sans substitute guidance.
 */
/** 4px base unit — design.md spacing scale. */
export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  section: 96,
} as const;

/** design.md border-radius scale. */
export const Radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 9999,
  full: 9999,
} as const;

/**
 * Typography — design.md scale rendered with the system font.
 * Display roles use weight 600 + negative letter-spacing (the Cal Sans
 * substitute signature). Body/UI roles stay neutral (Inter equivalent).
 * Sizes are adapted slightly for mobile legibility where noted.
 */
export const Typography = {
  displayLg: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '600' as const,
    letterSpacing: -1.2,
    maxFontSizeMultiplier: 1.3,
  },
  displayMd: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '600' as const,
    letterSpacing: -0.8,
    maxFontSizeMultiplier: 1.3,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600' as const,
    letterSpacing: -0.5,
    maxFontSizeMultiplier: 1.35,
  },
  subtitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    maxFontSizeMultiplier: 1.4,
  },
  titleSmall: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: 0,
    maxFontSizeMultiplier: 1.4,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
    maxFontSizeMultiplier: 2,
  },
  bodySemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
    maxFontSizeMultiplier: 2,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
    letterSpacing: 0,
    maxFontSizeMultiplier: 2,
  },
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0,
    maxFontSizeMultiplier: 2,
  },
} as const;

/** Default Dynamic Type cap for themed text without an explicit type style. */
export const DEFAULT_MAX_FONT_SIZE_MULTIPLIER = 2;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "'JetBrains Mono', SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
