import { create } from 'zustand';

import {
  deleteRemotePetReminder,
  pushPetReminder,
} from '@/services/sync/reminders-sync';
import { syncPetReminderNotificationSchedule } from '@/services/notifications/pet-reminder-schedule';
import * as petReminderStorage from '@/storage/pet-reminder.storage';
import { usePetRecordStore } from '@/stores/pet-record.store';
import { useUserStore } from '@/stores/user.store';
import type { PetReminder, ReminderTypeId } from '@/types/pet-reminder';
import { DEFAULT_REMINDER_RECURRENCE } from '@/types/pet-reminder';
import { DEFAULT_REMINDER_TIME } from '@/types/reminder';
import { computeNextDueDate } from '@/utils/reminder-recurrence';
import { reminderToRecord } from '@/utils/reminder-to-record';

function getActiveUserId(): string | null {
  return useUserStore.getState().userId;
}

function createReminderId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

type PetReminderState = {
  reminders: PetReminder[];
  isLoading: boolean;
  error: string | null;
  loadReminders: (petId: string) => Promise<void>;
  loadRemindersByType: (petId: string, type: ReminderTypeId) => Promise<void>;
  clearReminders: () => void;
  createReminder: (reminder: PetReminder) => Promise<void>;
  updateReminder: (reminder: PetReminder) => Promise<void>;
  completeReminder: (id: string, petId: string) => Promise<void>;
  deleteReminder: (id: string, petId: string) => Promise<void>;
  clearError: () => void;
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

async function syncReminderNotifications(): Promise<void> {
  try {
    await syncPetReminderNotificationSchedule();
  } catch (error) {
    console.warn('Failed to sync pet reminder notifications', error);
  }
}

export const usePetReminderStore = create<PetReminderState>((set, get) => ({
  reminders: [],
  isLoading: false,
  error: null,

  loadReminders: async (petId) => {
    const hasCachedData = get().reminders.length > 0;
    set({ isLoading: !hasCachedData, error: null });

    try {
      const reminders = await petReminderStorage.getPetRemindersByPetId(petId);
      set({ reminders, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to load reminders'),
      });
    }
  },

  loadRemindersByType: async (petId, type) => {
    set({ isLoading: true, error: null });

    try {
      const reminders = await petReminderStorage.getPetRemindersByPetIdAndType(petId, type);
      set({ reminders, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to load reminders'),
      });
    }
  },

  clearReminders: () => set({ reminders: [], error: null }),

  createReminder: async (reminder) => {
    const hasCachedData = get().reminders.length > 0;
    set({ isLoading: !hasCachedData, error: null });

    try {
      await petReminderStorage.createPetReminder(reminder);

      const userId = getActiveUserId();
      if (userId) {
        try {
          await pushPetReminder(userId, reminder);
        } catch (syncError) {
          console.warn('Failed to sync new reminder to cloud', syncError);
        }
      }

      const reminders = await petReminderStorage.getPetRemindersByPetId(reminder.petId);
      set({ reminders, isLoading: false });
      await syncReminderNotifications();
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to create reminder'),
      });
      throw error;
    }
  },

  updateReminder: async (reminder) => {
    const hasCachedData = get().reminders.length > 0;
    set({ isLoading: !hasCachedData, error: null });

    try {
      await petReminderStorage.updatePetReminder(reminder);

      const userId = getActiveUserId();
      if (userId) {
        try {
          await pushPetReminder(userId, reminder);
        } catch (syncError) {
          console.warn('Failed to sync updated reminder to cloud', syncError);
        }
      }

      const reminders = await petReminderStorage.getPetRemindersByPetId(reminder.petId);
      set({ reminders, isLoading: false });
      await syncReminderNotifications();
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to update reminder'),
      });
      throw error;
    }
  },

  completeReminder: async (id, petId) => {
    set({ isLoading: true, error: null });

    try {
      const reminder = await petReminderStorage.getPetReminderById(id);

      if (!reminder || reminder.status === 'completed') {
        throw new Error('Reminder is not available to complete');
      }

      const completedAt = new Date().toISOString();
      const record = reminderToRecord(reminder, completedAt);

      await usePetRecordStore.getState().createRecord(record);

      const completedReminder: PetReminder = {
        ...reminder,
        status: 'completed',
        completedAt,
        recordId: record.id,
        updatedAt: completedAt,
      };

      await petReminderStorage.updatePetReminder(completedReminder);

      const userId = getActiveUserId();
      if (userId) {
        try {
          await pushPetReminder(userId, completedReminder);
        } catch (syncError) {
          console.warn('Failed to sync completed reminder to cloud', syncError);
        }
      }

      const nextDueDate = computeNextDueDate(reminder.dueDate, reminder.recurrence.frequency);

      if (nextDueDate) {
        const nextReminder = {
          ...reminder,
          id: createReminderId(),
          dueDate: nextDueDate,
          dueTime: reminder.dueTime ?? { ...DEFAULT_REMINDER_TIME },
          recurrence: reminder.recurrence ?? { ...DEFAULT_REMINDER_RECURRENCE },
          status: 'pending' as const,
          completedAt: null,
          recordId: null,
          createdAt: completedAt,
          updatedAt: completedAt,
        } satisfies PetReminder;

        await petReminderStorage.createPetReminder(nextReminder);

        if (userId) {
          try {
            await pushPetReminder(userId, nextReminder);
          } catch (syncError) {
            console.warn('Failed to sync next recurring reminder to cloud', syncError);
          }
        }
      }

      const reminders = await petReminderStorage.getPetRemindersByPetId(petId);
      set({ reminders, isLoading: false });
      await syncReminderNotifications();
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to complete reminder'),
      });
      throw error;
    }
  },

  deleteReminder: async (id, _petId) => {
    set({ isLoading: true, error: null });

    try {
      await petReminderStorage.deletePetReminder(id);

      if (getActiveUserId()) {
        try {
          await deleteRemotePetReminder(id);
        } catch (syncError) {
          console.warn('Failed to delete reminder from cloud', syncError);
        }
      }

      const reminders = get().reminders.filter((reminder) => reminder.id !== id);
      set({ reminders, isLoading: false });
      await syncReminderNotifications();
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to delete reminder'),
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
