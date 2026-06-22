import { Platform } from 'react-native';

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
export const Palette = {
  ink: '#111111',
  inkActive: '#242424',
  body: '#374151',
  muted: '#6b7280',
  mutedSoft: '#898989',
  hairline: '#e5e7eb',
  hairlineSoft: '#f3f4f6',
  canvas: '#ffffff',
  surfaceSoft: '#f8f9fa',
  surfaceCard: '#f5f5f5',
  surfaceStrong: '#e5e7eb',
  surfaceDark: '#101010',
  surfaceDarkElevated: '#1a1a1a',
  onDark: '#ffffff',
  onDarkSoft: '#a1a1aa',
  brandAccent: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  badgeOrange: '#fb923c',
  badgePink: '#ec4899',
  badgeViolet: '#8b5cf6',
  badgeEmerald: '#34d399',
} as const;

export const Colors = {
  light: {
    text: Palette.ink,
    textSecondary: Palette.muted,
    textTertiary: Palette.mutedSoft,
    background: Palette.canvas,
    surface: Palette.surfaceCard,
    surfaceElevated: Palette.canvas,
    surfaceSoft: Palette.surfaceSoft,
    primary: Palette.ink,
    primaryActive: Palette.inkActive,
    primaryText: Palette.onDark,
    secondary: Palette.surfaceStrong,
    secondaryText: Palette.ink,
    border: Palette.hairline,
    borderSoft: Palette.hairlineSoft,
    tint: Palette.ink,
    icon: Palette.muted,
    accent: Palette.brandAccent,
    success: Palette.success,
    warning: Palette.warning,
    alert: Palette.error,
    tabIconDefault: Palette.muted,
    tabIconSelected: Palette.ink,
  },
  dark: {
    text: Palette.onDark,
    textSecondary: Palette.onDarkSoft,
    textTertiary: '#71717a',
    background: Palette.surfaceDark,
    surface: Palette.surfaceDarkElevated,
    surfaceElevated: '#242424',
    surfaceSoft: '#161616',
    primary: Palette.onDark,
    primaryActive: '#e4e4e7',
    primaryText: Palette.ink,
    secondary: '#242424',
    secondaryText: Palette.onDark,
    border: '#2a2a2a',
    borderSoft: '#202020',
    tint: Palette.onDark,
    icon: Palette.onDarkSoft,
    accent: '#60a5fa',
    success: Palette.success,
    warning: Palette.warning,
    alert: Palette.error,
    tabIconDefault: Palette.onDarkSoft,
    tabIconSelected: Palette.onDark,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

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
    maxFontSizeMultiplier: 1.5,
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
