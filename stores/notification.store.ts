import { create } from 'zustand';

import {
  cancelCheckInReminder,
  getSkippedReminders,
  pruneExpiredSkips,
  requestNotificationPermission,
  skipNextReminder as skipNextReminderService,
  syncCheckInReminderSchedule,
  type SkippedReminder,
} from '@/services/notifications';
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
  skippedReminders: SkippedReminder[];
  skipFeedbackMessage: string | null;
  isLoading: boolean;
  isSkipping: boolean;
  error: string | null;
  loadNotificationSettings: () => Promise<void>;
  savePreference: (preference: CheckInPreference) => Promise<void>;
  savePermission: (permission: NotificationPermissionStatus) => Promise<void>;
  skipNextReminder: () => Promise<void>;
  clearSkipFeedbackMessage: () => void;
  clearError: () => void;
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  preference: null,
  permission: null,
  skippedReminders: [],
  skipFeedbackMessage: null,
  isLoading: false,
  isSkipping: false,
  error: null,

  loadNotificationSettings: async () => {
    set({ isLoading: true, error: null });

    try {
      const [preference, permission, skippedReminders] = await Promise.all([
        getCheckInPreferences(),
        getNotificationPermission(),
        pruneExpiredSkips().then(() => getSkippedReminders()),
      ]);

      set({ preference, permission, skippedReminders, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to load notification settings'),
      });
    }
  },

  savePreference: async (preference) => {
    set({ isLoading: true, error: null, skipFeedbackMessage: null });

    try {
      await setCheckInPreferences(preference);
      set({ preference, isLoading: false });
      await syncCheckInReminderSchedule({ preference });
      const skippedReminders = await getSkippedReminders();
      set({ skippedReminders });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to save check-in preference'),
      });
      throw error;
    }
  },

  savePermission: async (permission) => {
    set({ isLoading: true, error: null, skipFeedbackMessage: null });

    try {
      if (permission === 'allowed') {
        await requestNotificationPermission();
      } else {
        await cancelCheckInReminder();
      }

      await setNotificationPermission(permission);
      set({ permission, isLoading: false });
      await syncCheckInReminderSchedule({ permission });
      const skippedReminders = await getSkippedReminders();
      set({ skippedReminders });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to save notification permission'),
      });
      throw error;
    }
  },

  skipNextReminder: async () => {
    const { preference } = get();

    set({ isSkipping: true, error: null });

    try {
      await skipNextReminderService(preference);
      const skippedReminders = await getSkippedReminders();
      set({
        skippedReminders,
        skipFeedbackMessage: 'Next reminder skipped',
        isSkipping: false,
      });
    } catch (error) {
      set({
        isSkipping: false,
        error: getErrorMessage(error, 'Failed to skip reminder'),
      });
      throw error;
    }
  },

  clearSkipFeedbackMessage: () => set({ skipFeedbackMessage: null }),

  clearError: () => set({ error: null }),
}));
