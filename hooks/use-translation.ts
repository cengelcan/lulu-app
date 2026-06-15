import { useCallback } from 'react';

import { translate } from '@/i18n';
import type { TranslationParams } from '@/i18n/types';
import { useLanguageStore } from '@/stores/language.store';

export function useTranslation() {
  const resolvedLanguage = useLanguageStore((state) => state.resolvedLanguage);
  const languagePreference = useLanguageStore((state) => state.languagePreference);

  const t = useCallback(
    (key: string, params?: TranslationParams) => translate(resolvedLanguage, key, params),
    [resolvedLanguage]
  );

  return { t, language: resolvedLanguage, languagePreference };
}
