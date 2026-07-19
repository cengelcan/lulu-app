import type { ResolvedLanguage } from '@/types/language';

const LOCALE_BY_LANGUAGE: Record<ResolvedLanguage, string> = {
  en: 'en-US',
  de: 'de-DE',
  tr: 'tr-TR',
};

export function getLocaleTag(language: ResolvedLanguage): string {
  return LOCALE_BY_LANGUAGE[language];
}
