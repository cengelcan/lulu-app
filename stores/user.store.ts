import { create } from 'zustand';

import { getUserProfile, setUserProfile } from '@/storage/user.storage';
import type { AuthProvider, UserProfile } from '@/types/user';

type UserState = {
  displayName: string | null;
  avatarUri: string | null;
  provider: AuthProvider;
  email: string | null;
  isPlusActive: boolean;
  isLoading: boolean;
  error: string | null;
  loadUserProfile: () => Promise<void>;
  updateDisplayName: (displayName: string | null) => Promise<void>;
  updateAvatarUri: (avatarUri: string | null) => Promise<void>;
  clearError: () => void;
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export const useUserStore = create<UserState>((set, get) => ({
  displayName: null,
  avatarUri: null,
  provider: 'guest',
  email: null,
  isPlusActive: false,
  isLoading: false,
  error: null,

  loadUserProfile: async () => {
    set({ isLoading: true, error: null });

    try {
      const profile = await getUserProfile();
      set({
        displayName: profile.displayName,
        avatarUri: profile.avatarUri,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to load profile'),
      });
    }
  },

  updateDisplayName: async (displayName) => {
    const trimmed = displayName?.trim() ?? '';
    const nextDisplayName = trimmed.length > 0 ? trimmed : null;

    set({ error: null });

    try {
      const profile: UserProfile = {
        displayName: nextDisplayName,
        avatarUri: get().avatarUri,
      };

      await setUserProfile(profile);
      set({ displayName: nextDisplayName });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to save name') });
      throw error;
    }
  },

  updateAvatarUri: async (avatarUri) => {
    set({ error: null });

    try {
      const profile: UserProfile = {
        displayName: get().displayName,
        avatarUri,
      };

      await setUserProfile(profile);
      set({ avatarUri });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to save photo') });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
