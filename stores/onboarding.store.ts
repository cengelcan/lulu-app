import { create } from 'zustand';

import {
  completeCurrentOnboarding,
  getCurrentOnboardingCompleted,
} from '@/storage/onboarding.storage';
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
      const hasCompletedOnboarding = await getCurrentOnboardingCompleted();
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
      await completeCurrentOnboarding();
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
