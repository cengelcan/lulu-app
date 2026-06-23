import { create } from 'zustand';

import {
  getAppLanguagePreference,
  setAppLanguagePreference,
} from '@/storage/prefs.storage';
import {
  syncCheckInReminderSchedule,
  syncPetReminderNotificationSchedule,
} from '@/services/notifications';
import type { AppLanguagePreference, ResolvedLanguage } from '@/types/language';
import {
  DEFAULT_APP_LANGUAGE_PREFERENCE,
  resolveLanguagePreference,
} from '@/types/language';

type LanguageState = {
  languagePreference: AppLanguagePreference;
  resolvedLanguage: ResolvedLanguage;
  isLoading: boolean;
  loadLanguage: () => Promise<void>;
  saveLanguage: (preference: AppLanguagePreference) => Promise<void>;
};

export const useLanguageStore = create<LanguageState>((set) => ({
  languagePreference: DEFAULT_APP_LANGUAGE_PREFERENCE,
  resolvedLanguage: resolveLanguagePreference(DEFAULT_APP_LANGUAGE_PREFERENCE),
  isLoading: false,

  loadLanguage: async () => {
    set({ isLoading: true });

    try {
      const languagePreference = await getAppLanguagePreference();
      set({
        languagePreference,
        resolvedLanguage: resolveLanguagePreference(languagePreference),
        isLoading: false,
      });
    } catch {
      set({
        languagePreference: DEFAULT_APP_LANGUAGE_PREFERENCE,
        resolvedLanguage: resolveLanguagePreference(DEFAULT_APP_LANGUAGE_PREFERENCE),
        isLoading: false,
      });
    }
  },

  saveLanguage: async (languagePreference) => {
    await setAppLanguagePreference(languagePreference);
    set({
      languagePreference,
      resolvedLanguage: resolveLanguagePreference(languagePreference),
    });
    void syncCheckInReminderSchedule();
    void syncPetReminderNotificationSchedule();
  },
}));
