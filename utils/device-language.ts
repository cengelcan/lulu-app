import { getLocales } from 'expo-localization';

import type { ResolvedLanguage } from '@/types/language';
import { resolveLanguageCode } from '@/utils/resolve-language-code';

export { resolveLanguageCode } from '@/utils/resolve-language-code';

export function resolveDeviceLanguage(): ResolvedLanguage {
  return resolveLanguageCode(getLocales()[0]?.languageCode);
}
