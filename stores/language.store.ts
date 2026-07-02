import { create } from 'zustand';
import { Platform } from 'react-native';

import {
  getAppLanguagePreference,
  setAppLanguagePreference,
} from '@/storage/prefs.storage';
import {
  syncCheckInReminderSchedule,
  syncPetReminderNotificationSchedule,
} from '@/services/notifications';
import { ensureAndroidNotificationChannels } from '@/services/notifications/permissions';
import type { AppLanguagePreference, ResolvedLanguage } from '@/types/language';
import {
  DEFAULT_APP_LANGUAGE_PREFERENCE,
} from '@/types/language';
import { resolveLanguagePreference } from '@/utils/resolve-language-preference';

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
      if (Platform.OS === 'android') {
        void ensureAndroidNotificationChannels(resolveLanguagePreference(languagePreference));
      }
    } catch {
      set({
        languagePreference: DEFAULT_APP_LANGUAGE_PREFERENCE,
        resolvedLanguage: resolveLanguagePreference(DEFAULT_APP_LANGUAGE_PREFERENCE),
        isLoading: false,
      });
      if (Platform.OS === 'android') {
        void ensureAndroidNotificationChannels(
          resolveLanguagePreference(DEFAULT_APP_LANGUAGE_PREFERENCE)
        );
      }
    }
  },

  saveLanguage: async (languagePreference) => {
    const resolvedLanguage = resolveLanguagePreference(languagePreference);
    await setAppLanguagePreference(languagePreference);
    set({
      languagePreference,
      resolvedLanguage,
    });
    if (Platform.OS === 'android') {
      void ensureAndroidNotificationChannels(resolvedLanguage);
    }
    void syncCheckInReminderSchedule();
    void syncPetReminderNotificationSchedule();
  },
}));
