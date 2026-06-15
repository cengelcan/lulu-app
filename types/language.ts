import { resolveDeviceLanguage } from '@/utils/device-language';

export type ResolvedLanguage = 'en' | 'tr' | 'de';

/** Stored user preference — `system` follows the device locale. */
export type AppLanguagePreference = 'system' | ResolvedLanguage;

/** @deprecated Use ResolvedLanguage for catalogs or AppLanguagePreference for storage. */
export type AppLanguage = ResolvedLanguage;

export const DEFAULT_APP_LANGUAGE_PREFERENCE: AppLanguagePreference = 'system';

/** @deprecated Use DEFAULT_APP_LANGUAGE_PREFERENCE. */
export const DEFAULT_APP_LANGUAGE: ResolvedLanguage = 'en';

export const APP_LANGUAGE_PREFERENCE_LABELS: Record<AppLanguagePreference, string> = {
  system: 'System',
  en: 'English',
  tr: 'Türkçe',
  de: 'Deutsch',
};

/** @deprecated Use APP_LANGUAGE_PREFERENCE_LABELS. */
export const APP_LANGUAGE_LABELS: Record<ResolvedLanguage, string> = {
  en: 'English',
  tr: 'Türkçe',
  de: 'Deutsch',
};

export function resolveLanguagePreference(
  preference: AppLanguagePreference
): ResolvedLanguage {
  if (preference === 'system') {
    return resolveDeviceLanguage();
  }

  return preference;
}
