import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useExperiencePreferencesStore } from '@/stores/experience-preferences.store';
import { resolveThemeColorScheme } from '@/utils/theme-preference';

export function useColorScheme(): 'light' | 'dark' {
  const systemColorScheme = useSystemColorScheme();
  const preference = useExperiencePreferencesStore(
    (state) => state.preferences?.themePreference
  );
  return resolveThemeColorScheme(preference ?? 'system', systemColorScheme);
}
