import { create } from 'zustand';

import {
  getCheckInPreferences,
  getNotificationPermission,
  setCheckInPreferences,
  setNotificationPermission,
  type NotificationPermissionStatus,
} from '@/storage/prefs.storage';
import type { CheckInPreference } from '@/types/check-in';

type NotificationState = {
  preference: CheckInPreference | null;
  permission: NotificationPermissionStatus | null;
  isLoading: boolean;
  error: string | null;
  loadNotificationSettings: () => Promise<void>;
  savePreference: (preference: CheckInPreference) => Promise<void>;
  savePermission: (permission: NotificationPermissionStatus) => Promise<void>;
  clearError: () => void;
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  preference: null,
  permission: null,
  isLoading: false,
  error: null,

  loadNotificationSettings: async () => {
    set({ isLoading: true, error: null });

    try {
      const [preference, permission] = await Promise.all([
        getCheckInPreferences(),
        getNotificationPermission(),
      ]);

      set({ preference, permission, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to load notification settings'),
      });
    }
  },

  savePreference: async (preference) => {
    set({ isLoading: true, error: null });

    try {
      await setCheckInPreferences(preference);
      set({ preference, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to save check-in preference'),
      });
      throw error;
    }
  },

  savePermission: async (permission) => {
    set({ isLoading: true, error: null });

    try {
      await setNotificationPermission(permission);
      set({ permission, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to save notification permission'),
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
