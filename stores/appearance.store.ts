import { create } from 'zustand';

import { getAppAppearance, setAppAppearance } from '@/storage/prefs.storage';
import type { AppAppearance } from '@/types/appearance';
import { DEFAULT_APP_APPEARANCE } from '@/types/appearance';

type AppearanceState = {
  appearance: AppAppearance;
  isLoading: boolean;
  loadAppearance: () => Promise<void>;
  saveAppearance: (appearance: AppAppearance) => Promise<void>;
};

export const useAppearanceStore = create<AppearanceState>((set) => ({
  appearance: DEFAULT_APP_APPEARANCE,
  isLoading: false,

  loadAppearance: async () => {
    set({ isLoading: true });

    try {
      const appearance = await getAppAppearance();
      set({ appearance, isLoading: false });
    } catch {
      set({ appearance: DEFAULT_APP_APPEARANCE, isLoading: false });
    }
  },

  saveAppearance: async (appearance) => {
    await setAppAppearance(appearance);
    set({ appearance });
  },
}));
