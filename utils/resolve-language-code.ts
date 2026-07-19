import type { ResolvedLanguage } from '@/types/language';

export function resolveLanguageCode(
  languageCode: string | null | undefined
): ResolvedLanguage {
  if (languageCode?.toLowerCase() === 'de') {
    return 'de';
  }

  if (languageCode?.toLowerCase() === 'tr') {
    return 'tr';
  }

  return 'en';
}
