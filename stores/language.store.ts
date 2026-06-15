import { create } from 'zustand';

import { getAppLanguage, setAppLanguage } from '@/storage/prefs.storage';
import type { AppLanguage } from '@/types/language';
import { DEFAULT_APP_LANGUAGE } from '@/types/language';

type LanguageState = {
  language: AppLanguage;
  isLoading: boolean;
  loadLanguage: () => Promise<void>;
  saveLanguage: (language: AppLanguage) => Promise<void>;
};

export const useLanguageStore = create<LanguageState>((set) => ({
  language: DEFAULT_APP_LANGUAGE,
  isLoading: false,

  loadLanguage: async () => {
    set({ isLoading: true });

    try {
      const language = await getAppLanguage();
      set({ language, isLoading: false });
    } catch {
      set({ language: DEFAULT_APP_LANGUAGE, isLoading: false });
    }
  },

  saveLanguage: async (language) => {
    await setAppLanguage(language);
    set({ language });
  },
}));
