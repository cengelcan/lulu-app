import { create } from 'zustand';

import {
  cancelAllPetReminderNotifications,
  cancelCheckInReminder,
  requestNotificationPermission,
  syncCheckInReminderSchedule,
  syncPetReminderNotificationSchedule,
} from '@/services/notifications';
import {
  fetchRemoteFamilyActivityDigestEnabled,
  saveRemoteFamilyActivityDigestEnabled,
} from '@/services/notifications/family-activity-digest-preference';
import { resolveStoredNotificationPermission } from '@/services/notifications/permission-status';
import { registerFamilyActivityPushToken } from '@/services/notifications/push-registration';
import { requireAuthenticatedUserId } from '@/services/sync/require-authenticated-user-id';
import {
  getCheckInReminderTime,
  getCurrentUserId,
  getFamilyActivityDigestEnabled,
  getNotificationPermission,
  getPetReminderNotificationsEnabled,
  setCheckInReminderTime,
  setFamilyActivityDigestEnabled,
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
  familyActivityDigestEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  loadNotificationSettings: () => Promise<void>;
  saveReminderTime: (reminderTime: ReminderTime) => Promise<void>;
  savePermission: (permission: NotificationPermissionStatus) => Promise<NotificationPermissionStatus>;
  savePetReminderNotificationsEnabled: (enabled: boolean) => Promise<boolean>;
  saveFamilyActivityDigestEnabled: (enabled: boolean) => Promise<boolean>;
  clearError: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  reminderTime: null,
  permission: null,
  petReminderNotificationsEnabled: true,
  familyActivityDigestEnabled: false,
  isLoading: false,
  error: null,

  loadNotificationSettings: async () => {
    set({ isLoading: true, error: null });

    try {
      const [
        reminderTime,
        permission,
        petReminderNotificationsEnabled,
        cachedFamilyActivityDigestEnabled,
        userId,
      ] = await Promise.all([
        getCheckInReminderTime(),
        getNotificationPermission(),
        getPetReminderNotificationsEnabled(),
        getFamilyActivityDigestEnabled(),
        getCurrentUserId(),
      ]);

      let familyActivityDigestEnabled = cachedFamilyActivityDigestEnabled;
      if (userId) {
        try {
          familyActivityDigestEnabled =
            await fetchRemoteFamilyActivityDigestEnabled(userId);
          await setFamilyActivityDigestEnabled(familyActivityDigestEnabled);
        } catch (error) {
          console.warn(
            '[notifications] Using cached family activity digest preference',
            error
          );
        }
      }

      set({
        reminderTime,
        permission,
        petReminderNotificationsEnabled,
        familyActivityDigestEnabled,
        isLoading: false,
      });
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

  saveFamilyActivityDigestEnabled: async (enabled) => {
    set({ isLoading: true, error: null });

    try {
      let resolvedEnabled = enabled;

      if (enabled) {
        const osGranted = await requestNotificationPermission(
          useLanguageStore.getState().resolvedLanguage
        );
        if (!osGranted) {
          resolvedEnabled = false;
        } else {
          const registered = await registerFamilyActivityPushToken();
          if (!registered) {
            resolvedEnabled = false;
          }
        }
      }

      const userId = await requireAuthenticatedUserId();
      await saveRemoteFamilyActivityDigestEnabled(
        userId,
        resolvedEnabled,
        useLanguageStore.getState().resolvedLanguage
      );
      await setFamilyActivityDigestEnabled(resolvedEnabled);
      set({ familyActivityDigestEnabled: resolvedEnabled, isLoading: false });
      return resolvedEnabled;
    } catch (error) {
      set({
        isLoading: false,
        error: getStoreErrorKey(error, 'errors.saveFamilyActivityDigest'),
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
