import { Platform } from 'react-native';

/** PRD palette — Sage Green design system */
export const Palette = {
  sageGreen: '#6B8F71',
  softSage: '#8FAE96',
  warmCream: '#FAF8F4',
  success: '#34C759',
  warning: '#FFCC00',
  alert: '#FF3B30',
} as const;

export const Colors = {
  light: {
    text: '#1A1F1C',
    textSecondary: '#5C665E',
    background: Palette.warmCream,
    surface: '#FFFFFF',
    primary: Palette.sageGreen,
    primaryText: '#FFFFFF',
    secondary: Palette.softSage,
    secondaryText: '#FFFFFF',
    border: '#E4E8E4',
    tint: Palette.sageGreen,
    icon: '#5C665E',
    success: Palette.success,
    warning: Palette.warning,
    alert: Palette.alert,
    tabIconDefault: '#5C665E',
    tabIconSelected: Palette.sageGreen,
  },
  dark: {
    text: '#F5F3EF',
    textSecondary: '#A8B5AB',
    background: '#141816',
    surface: '#1E2420',
    primary: '#7DA383',
    primaryText: '#FFFFFF',
    secondary: Palette.softSage,
    secondaryText: '#1A1F1C',
    border: '#2E3630',
    tint: Palette.softSage,
    icon: '#A8B5AB',
    success: Palette.success,
    warning: Palette.warning,
    alert: Palette.alert,
    tabIconDefault: '#A8B5AB',
    tabIconSelected: Palette.softSage,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Typography = {
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700' as const,
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodySemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  button: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
} as const;

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
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
