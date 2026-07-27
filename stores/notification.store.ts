import { create } from 'zustand';

import {
  cancelAllPetReminderNotifications,
  cancelAllMedicationDoseNotifications,
  cancelCheckInReminder,
  requestNotificationPermission,
  syncCheckInReminderSchedule,
  syncPetReminderNotificationSchedule,
  syncMedicationDoseNotificationSchedule,
  hasNotificationPermission,
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
import { useExperiencePreferencesStore } from '@/stores/experience-preferences.store';
import type { ReminderTime } from '@/types/reminder';
import { getStoreErrorKey } from '@/utils/store-error';

type NotificationState = {
  reminderTime: ReminderTime | null;
  permission: NotificationPermissionStatus | null;
  petReminderNotificationsEnabled: boolean;
  dailyCheckInNotificationsEnabled: boolean;
  medicationDoseNotificationsEnabled: boolean;
  medicationRefillNotificationsEnabled: boolean;
  familyActivityDigestEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  loadNotificationSettings: () => Promise<void>;
  saveReminderTime: (reminderTime: ReminderTime) => Promise<void>;
  savePermission: (permission: NotificationPermissionStatus) => Promise<NotificationPermissionStatus>;
  savePetReminderNotificationsEnabled: (enabled: boolean) => Promise<boolean>;
  saveDailyCheckInNotificationsEnabled: (enabled: boolean) => Promise<boolean>;
  saveMedicationDoseNotificationsEnabled: (enabled: boolean) => Promise<boolean>;
  saveMedicationRefillNotificationsEnabled: (enabled: boolean) => Promise<boolean>;
  saveFamilyActivityDigestEnabled: (enabled: boolean) => Promise<boolean>;
  clearError: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  reminderTime: null,
  permission: null,
  petReminderNotificationsEnabled: true,
  dailyCheckInNotificationsEnabled: false,
  medicationDoseNotificationsEnabled: true,
  medicationRefillNotificationsEnabled: true,
  familyActivityDigestEnabled: false,
  isLoading: false,
  error: null,

  loadNotificationSettings: async () => {
    set({ isLoading: true, error: null });

    try {
      const [
        reminderTime,
        storedPermission,
        petReminderNotificationsEnabled,
        cachedFamilyActivityDigestEnabled,
        userId,
        osPermissionGranted,
      ] = await Promise.all([
        getCheckInReminderTime(),
        getNotificationPermission(),
        getPetReminderNotificationsEnabled(),
        getFamilyActivityDigestEnabled(),
        getCurrentUserId(),
        hasNotificationPermission(),
      ]);

      const permission: NotificationPermissionStatus | null = osPermissionGranted
        ? 'allowed'
        : storedPermission === 'allowed'
          ? 'denied'
          : storedPermission;
      if (permission !== storedPermission && permission !== null) {
        await setNotificationPermission(permission);
      }

      let remoteFamilyActivityDigestEnabled = cachedFamilyActivityDigestEnabled;
      await useExperiencePreferencesStore.getState().loadPreferences();
      let categories = useExperiencePreferencesStore.getState().preferences?.notifications;
      if (userId) {
        try {
          remoteFamilyActivityDigestEnabled =
            await fetchRemoteFamilyActivityDigestEnabled(userId);
          const shouldRestoreLocalDigestOptIn =
            storedPermission === 'denied' &&
            permission === 'allowed' &&
            categories?.familyDigest === true;

          if (shouldRestoreLocalDigestOptIn) {
            const registered = await registerFamilyActivityPushToken();
            if (registered) {
              remoteFamilyActivityDigestEnabled = true;
              await saveRemoteFamilyActivityDigestEnabled(
                userId,
                true,
                useLanguageStore.getState().resolvedLanguage
              );
            }
          }
          await setFamilyActivityDigestEnabled(remoteFamilyActivityDigestEnabled);
          if (permission !== 'denied' && !shouldRestoreLocalDigestOptIn) {
            await useExperiencePreferencesStore
              .getState()
              .saveNotificationCategoryPreference(
                'familyDigest',
                remoteFamilyActivityDigestEnabled
              );
            categories = useExperiencePreferencesStore.getState().preferences?.notifications;
          }
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
        dailyCheckInNotificationsEnabled: categories?.dailyCheckIn ?? permission === 'allowed',
        medicationDoseNotificationsEnabled: categories?.medicationDoses ?? true,
        medicationRefillNotificationsEnabled: categories?.medicationRefill ?? true,
        familyActivityDigestEnabled:
          categories?.familyDigest ?? remoteFamilyActivityDigestEnabled,
        isLoading: false,
      });
      await Promise.all([
        syncCheckInReminderSchedule({
          permission,
          enabled: categories?.dailyCheckIn ?? false,
        }),
        syncPetReminderNotificationSchedule({
          enabled: categories?.petReminders ?? petReminderNotificationsEnabled,
        }),
        syncMedicationDoseNotificationSchedule({
          enabled: categories?.medicationDoses ?? true,
        }),
      ]);
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
      await useExperiencePreferencesStore
        .getState()
        .saveNotificationCategoryPreference('dailyCheckIn', resolvedPermission === 'allowed');
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
      let permission = useNotificationStore.getState().permission;

      if (enabled) {
        const osGranted = await requestNotificationPermission(
          useLanguageStore.getState().resolvedLanguage
        );
        permission = osGranted ? 'allowed' : 'denied';
        await setNotificationPermission(permission);
      } else {
        await cancelAllPetReminderNotifications();
      }

      await setPetReminderNotificationsEnabled(enabled);
      await useExperiencePreferencesStore
        .getState()
        .saveNotificationCategoryPreference('petReminders', enabled);
      set({ petReminderNotificationsEnabled: enabled, permission, isLoading: false });
      await syncPetReminderNotificationSchedule({ enabled });
      return enabled;
    } catch (error) {
      set({
        isLoading: false,
        error: getStoreErrorKey(error, 'errors.savePetReminderNotifications'),
      });
      throw error;
    }
  },

  saveDailyCheckInNotificationsEnabled: async (enabled) => {
    set({ isLoading: true, error: null });

    try {
      let permission = useNotificationStore.getState().permission;
      if (enabled) {
        const granted = await requestNotificationPermission(
          useLanguageStore.getState().resolvedLanguage
        );
        permission = granted ? 'allowed' : 'denied';
        await setNotificationPermission(permission);
      } else {
        await cancelCheckInReminder();
      }

      await useExperiencePreferencesStore
        .getState()
        .saveNotificationCategoryPreference('dailyCheckIn', enabled);
      set({ dailyCheckInNotificationsEnabled: enabled, permission, isLoading: false });
      await syncCheckInReminderSchedule({ permission, enabled });
      return enabled;
    } catch (error) {
      set({ isLoading: false, error: getStoreErrorKey(error, 'errors.saveNotificationPermission') });
      throw error;
    }
  },

  saveMedicationDoseNotificationsEnabled: async (enabled) => {
    set({ isLoading: true, error: null });

    try {
      let permission = useNotificationStore.getState().permission;
      if (enabled) {
        const granted = await requestNotificationPermission(
          useLanguageStore.getState().resolvedLanguage
        );
        permission = granted ? 'allowed' : 'denied';
        await setNotificationPermission(permission);
      } else {
        await cancelAllMedicationDoseNotifications();
      }

      await useExperiencePreferencesStore
        .getState()
        .saveNotificationCategoryPreference('medicationDoses', enabled);
      set({ medicationDoseNotificationsEnabled: enabled, permission, isLoading: false });
      await syncMedicationDoseNotificationSchedule({ enabled });
      return enabled;
    } catch (error) {
      set({ isLoading: false, error: getStoreErrorKey(error, 'errors.saveNotificationPermission') });
      throw error;
    }
  },

  saveMedicationRefillNotificationsEnabled: async (enabled) => {
    set({ isLoading: true, error: null });

    try {
      let permission = useNotificationStore.getState().permission;
      if (enabled) {
        const granted = await requestNotificationPermission(
          useLanguageStore.getState().resolvedLanguage
        );
        permission = granted ? 'allowed' : 'denied';
        await setNotificationPermission(permission);
      }

      await useExperiencePreferencesStore
        .getState()
        .saveNotificationCategoryPreference('medicationRefill', enabled);
      set({ medicationRefillNotificationsEnabled: enabled, permission, isLoading: false });
      return enabled;
    } catch (error) {
      set({ isLoading: false, error: getStoreErrorKey(error, 'errors.saveNotificationPermission') });
      throw error;
    }
  },

  saveFamilyActivityDigestEnabled: async (enabled) => {
    set({ isLoading: true, error: null });

    try {
      let deliveryEnabled = enabled;
      let permission = useNotificationStore.getState().permission;

      if (enabled) {
        const osGranted = await requestNotificationPermission(
          useLanguageStore.getState().resolvedLanguage
        );
        permission = osGranted ? 'allowed' : 'denied';
        await setNotificationPermission(permission);
        if (!osGranted) {
          deliveryEnabled = false;
        } else {
          const registered = await registerFamilyActivityPushToken();
          if (!registered) {
            deliveryEnabled = false;
          }
        }
      }

      const userId = await requireAuthenticatedUserId();
      await saveRemoteFamilyActivityDigestEnabled(
        userId,
        deliveryEnabled,
        useLanguageStore.getState().resolvedLanguage
      );
      await setFamilyActivityDigestEnabled(enabled);
      await useExperiencePreferencesStore
        .getState()
        .saveNotificationCategoryPreference('familyDigest', enabled);
      set({ familyActivityDigestEnabled: enabled, permission, isLoading: false });
      return enabled;
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
