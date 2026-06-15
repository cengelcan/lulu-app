import { useCallback } from 'react';

import { translate } from '@/i18n';
import { useLanguageStore } from '@/stores/language.store';
import type { TranslationParams } from '@/i18n/types';

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);

  const t = useCallback(
    (key: string, params?: TranslationParams) => translate(language, key, params),
    [language]
  );

  return { t, language };
}
