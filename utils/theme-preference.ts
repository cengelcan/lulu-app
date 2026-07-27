import type { ColorSchemeName } from 'react-native';

import type { ThemePreference } from '@/types/experience-preferences';

export type ResolvedThemeColorScheme = 'light' | 'dark';

export function getAppearanceColorScheme(
  preference: ThemePreference
): ColorSchemeName {
  return preference === 'system' ? 'unspecified' : preference;
}

export function resolveThemeColorScheme(
  preference: ThemePreference,
  systemColorScheme: ColorSchemeName | null | undefined
): ResolvedThemeColorScheme {
  if (preference === 'light' || preference === 'dark') {
    return preference;
  }

  return systemColorScheme === 'light' ? 'light' : 'dark';
}
