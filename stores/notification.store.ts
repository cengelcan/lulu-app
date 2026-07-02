import { create } from 'zustand';

import {
  cancelAllPetReminderNotifications,
  cancelCheckInReminder,
  requestNotificationPermission,
  syncCheckInReminderSchedule,
  syncPetReminderNotificationSchedule,
} from '@/services/notifications';
import { resolveStoredNotificationPermission } from '@/services/notifications/permission-status';
import {
  getCheckInReminderTime,
  getNotificationPermission,
  getPetReminderNotificationsEnabled,
  setCheckInReminderTime,
  setNotificationPermission,
  setPetReminderNotificationsEnabled,
  type NotificationPermissionStatus,
} from '@/storage/prefs.storage';
import { useLanguageStore } from '@/stores/language.store';
import type { ReminderTime } from '@/types/reminder';
import { getStoreErrorKey } from '@/utils/store-error';

type NotificationState = {
  reminderTime: ReminderTime | null;
  permission: NotificationPermissionStatus | null;
  petReminderNotificationsEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  loadNotificationSettings: () => Promise<void>;
  saveReminderTime: (reminderTime: ReminderTime) => Promise<void>;
  savePermission: (permission: NotificationPermissionStatus) => Promise<NotificationPermissionStatus>;
  savePetReminderNotificationsEnabled: (enabled: boolean) => Promise<boolean>;
  clearError: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  reminderTime: null,
  permission: null,
  petReminderNotificationsEnabled: true,
  isLoading: false,
  error: null,

  loadNotificationSettings: async () => {
    set({ isLoading: true, error: null });

    try {
      const [reminderTime, permission, petReminderNotificationsEnabled] = await Promise.all([
        getCheckInReminderTime(),
        getNotificationPermission(),
        getPetReminderNotificationsEnabled(),
      ]);

      set({ reminderTime, permission, petReminderNotificationsEnabled, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getStoreErrorKey(error, 'errors.loadNotificationSettings'),
      });
    }
  },

  saveReminderTime: async (reminderTime) => {
    set({ isLoading: true, error: null });

    try {
      await setCheckInReminderTime(reminderTime);
      set({ reminderTime, isLoading: false });
      await syncCheckInReminderSchedule({ reminderTime });
    } catch (error) {
      set({
        isLoading: false,
        error: getStoreErrorKey(error, 'errors.saveReminderTime'),
      });
      throw error;
    }
  },

  savePermission: async (permission) => {
    set({ isLoading: true, error: null });

    try {
      let resolvedPermission = permission;

      if (permission === 'allowed') {
        const osGranted = await requestNotificationPermission(
          useLanguageStore.getState().resolvedLanguage
        );
        resolvedPermission = resolveStoredNotificationPermission(permission, osGranted);
      } else {
        await cancelCheckInReminder();
      }

      await setNotificationPermission(resolvedPermission);
      set({ permission: resolvedPermission, isLoading: false });
      await syncCheckInReminderSchedule({ permission: resolvedPermission });
      return resolvedPermission;
    } catch (error) {
      set({
        isLoading: false,
        error: getStoreErrorKey(error, 'errors.saveNotificationPermission'),
      });
      throw error;
    }
  },

  savePetReminderNotificationsEnabled: async (enabled) => {
    set({ isLoading: true, error: null });

    try {
      let resolvedEnabled = enabled;

      if (enabled) {
        const osGranted = await requestNotificationPermission(
          useLanguageStore.getState().resolvedLanguage
        );
        if (!osGranted) {
          resolvedEnabled = false;
        }
      } else {
        await cancelAllPetReminderNotifications();
      }

      await setPetReminderNotificationsEnabled(resolvedEnabled);
      set({ petReminderNotificationsEnabled: resolvedEnabled, isLoading: false });
      await syncPetReminderNotificationSchedule({ enabled: resolvedEnabled });
      return resolvedEnabled;
    } catch (error) {
      set({
        isLoading: false,
        error: getStoreErrorKey(error, 'errors.savePetReminderNotifications'),
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
