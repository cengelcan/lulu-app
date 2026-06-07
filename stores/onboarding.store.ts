import { create } from 'zustand';

import {
  getOnboardingCompleted,
  setOnboardingCompleted,
} from '@/storage/prefs.storage';

type OnboardingState = {
  hasCompletedOnboarding: boolean | null;
  isLoading: boolean;
  error: string | null;
  loadOnboardingStatus: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  clearError: () => void;
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

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
        error: getErrorMessage(error, 'Failed to load onboarding status'),
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
        error: getErrorMessage(error, 'Failed to save onboarding status'),
      });
    }
  },

  clearError: () => set({ error: null }),
}));
