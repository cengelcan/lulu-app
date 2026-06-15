import { de } from '@/i18n/de';
import { en } from '@/i18n/en';
import { tr } from '@/i18n/tr';
import type { TranslationParams, Translations } from '@/i18n/types';
import type { ResolvedLanguage } from '@/types/language';
import { DEFAULT_APP_LANGUAGE } from '@/types/language';

const catalogs: Record<ResolvedLanguage, Translations> = {
  en,
  tr,
  de,
};

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = params[key];
    return value !== undefined ? String(value) : `{{${key}}}`;
  });
}

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === 'string' ? current : undefined;
}

export function translate(
  language: ResolvedLanguage,
  key: string,
  params?: TranslationParams
): string {
  const catalog = catalogs[language] ?? catalogs[DEFAULT_APP_LANGUAGE];
  const value = getNestedValue(catalog as unknown as Record<string, unknown>, key);

  if (value) {
    return interpolate(value, params);
  }

  const fallback = getNestedValue(
    catalogs[DEFAULT_APP_LANGUAGE] as unknown as Record<string, unknown>,
    key
  );

  if (fallback) {
    return interpolate(fallback, params);
  }

  return key;
}

export function getTranslations(language: ResolvedLanguage): Translations {
  return catalogs[language] ?? catalogs[DEFAULT_APP_LANGUAGE];
}
