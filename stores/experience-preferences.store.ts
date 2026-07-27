import { Appearance } from 'react-native';
import { create } from 'zustand';

import {
  loadExperiencePreferences,
  saveExperiencePreferences,
} from '@/storage/experience-preferences.storage';
import type {
  ExperiencePreferences,
  NotificationCategoryPreferences,
  ThemePreference,
  WeightUnitPreference,
} from '@/types/experience-preferences';
import { createDefaultExperiencePreferences } from '@/utils/experience-preferences';
import { getDeviceRegionalSnapshot } from '@/utils/device-regional-settings';
import { getAppearanceColorScheme } from '@/utils/theme-preference';

type ExperiencePreferencesState = {
  preferences: ExperiencePreferences | null;
  hasLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  loadPreferences: () => Promise<void>;
  saveThemePreference: (preference: ThemePreference) => Promise<void>;
  saveWeightUnitPreference: (preference: WeightUnitPreference) => Promise<void>;
  saveNotificationCategoryPreference: <K extends keyof NotificationCategoryPreferences>(
    category: K,
    enabled: NotificationCategoryPreferences[K]
  ) => Promise<void>;
};

function applyNativeThemePreference(preference: ThemePreference): void {
  Appearance.setColorScheme(getAppearanceColorScheme(preference));
}

export const useExperiencePreferencesStore = create<ExperiencePreferencesState>(
  (set, get) => ({
    preferences: null,
    hasLoaded: false,
    isLoading: false,
    error: null,

    loadPreferences: async () => {
      const state = get();
      if (state.hasLoaded || state.isLoading) {
        return;
      }

      set({ isLoading: true, error: null });
      const { measurementSystem } = getDeviceRegionalSnapshot();

      try {
        const preferences = await loadExperiencePreferences(measurementSystem);
        applyNativeThemePreference(preferences.themePreference);
        set({ preferences, hasLoaded: true, isLoading: false });
      } catch {
        const preferences = createDefaultExperiencePreferences(measurementSystem);
        applyNativeThemePreference(preferences.themePreference);
        set({
          preferences,
          hasLoaded: true,
          isLoading: false,
          error: 'preferences_load_failed',
        });
      }
    },

    saveThemePreference: async (themePreference) => {
      let preferences = get().preferences;

      if (!preferences) {
        await get().loadPreferences();
        preferences = get().preferences;
      }

      if (!preferences || preferences.themePreference === themePreference) {
        return;
      }

      const nextPreferences: ExperiencePreferences = {
        ...preferences,
        themePreference,
      };

      try {
        saveExperiencePreferences(nextPreferences);
        applyNativeThemePreference(themePreference);
        set({ preferences: nextPreferences, error: null });
      } catch {
        set({ error: 'preferences_save_failed' });
        throw new Error('preferences_save_failed');
      }
    },

    saveWeightUnitPreference: async (weightUnitPreference) => {
      let preferences = get().preferences;

      if (!preferences) {
        await get().loadPreferences();
        preferences = get().preferences;
      }

      if (!preferences || preferences.weightUnitPreference === weightUnitPreference) {
        return;
      }

      const nextPreferences: ExperiencePreferences = {
        ...preferences,
        weightUnitPreference,
      };

      try {
        saveExperiencePreferences(nextPreferences);
        set({ preferences: nextPreferences, error: null });
      } catch {
        set({ error: 'preferences_save_failed' });
        throw new Error('preferences_save_failed');
      }
    },

    saveNotificationCategoryPreference: async (category, enabled) => {
      let preferences = get().preferences;

      if (!preferences) {
        await get().loadPreferences();
        preferences = get().preferences;
      }

      if (!preferences || preferences.notifications[category] === enabled) {
        return;
      }

      const nextPreferences: ExperiencePreferences = {
        ...preferences,
        notifications: {
          ...preferences.notifications,
          [category]: enabled,
        },
      };

      try {
        saveExperiencePreferences(nextPreferences);
        set({ preferences: nextPreferences, error: null });
      } catch {
        set({ error: 'preferences_save_failed' });
        throw new Error('preferences_save_failed');
      }
    },
  })
);
