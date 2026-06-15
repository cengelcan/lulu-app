export type AppAppearance = 'system' | 'light' | 'dark';

export const DEFAULT_APP_APPEARANCE: AppAppearance = 'system';

export const APP_APPEARANCE_LABELS: Record<AppAppearance, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};
