import { getLocales } from 'expo-localization';

import type { ResolvedLanguage } from '@/types/language';

export function resolveDeviceLanguage(): ResolvedLanguage {
  const languageCode = getLocales()[0]?.languageCode?.toLowerCase();

  if (languageCode === 'de') {
    return 'de';
  }

  return 'en';
}
