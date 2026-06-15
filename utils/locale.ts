import type { ResolvedLanguage } from '@/types/language';

const LOCALE_BY_LANGUAGE: Record<ResolvedLanguage, string> = {
  en: 'en-US',
  tr: 'tr-TR',
  de: 'de-DE',
};

export function getLocaleTag(language: ResolvedLanguage): string {
  return LOCALE_BY_LANGUAGE[language];
}
