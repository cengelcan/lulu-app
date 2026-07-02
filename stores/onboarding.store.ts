import { create } from 'zustand';

import {
  getOnboardingCompleted,
  setOnboardingCompleted,
} from '@/storage/prefs.storage';
import { getStoreErrorKey } from '@/utils/store-error';

type OnboardingState = {
  hasCompletedOnboarding: boolean | null;
  isLoading: boolean;
  error: string | null;
  loadOnboardingStatus: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  clearError: () => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasCompletedOnboarding: null,
  isLoading: false,
  error: null,

  loadOnboardingStatus: async () => {
    set({ isLoading: true, error: null });

    try {
      const hasCompletedOnboarding = await getOnboardingCompleted();
      set({ hasCompletedOnboarding, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getStoreErrorKey(error, 'errors.loadOnboardingStatus'),
      });
    }
  },

  completeOnboarding: async () => {
    set({ isLoading: true, error: null });

    try {
      await setOnboardingCompleted(true);
      set({ hasCompletedOnboarding: true, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getStoreErrorKey(error, 'errors.saveOnboardingStatus'),
      });
    }
  },

  clearError: () => set({ error: null }),
}));
