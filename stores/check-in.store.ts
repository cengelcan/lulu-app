import { create } from 'zustand';

import { deleteRemoteCheckIn, pushCheckIn } from '@/services/sync/check-ins-sync';
import * as checkInStorage from '@/storage/check-in.storage';
import { useUserStore } from '@/stores/user.store';
import type { CheckIn } from '@/types/check-in';
import { getStoreErrorKey } from '@/utils/store-error';

function getActiveUserId(): string | null {
  return useUserStore.getState().userId;
}

type CheckInState = {
  latestCheckIn: CheckIn | null;
  checkIns: CheckIn[];
  isLoading: boolean;
  error: string | null;
  loadLatestCheckIn: (petId: string) => Promise<void>;
  loadCheckIns: (petId: string) => Promise<void>;
  clearCheckIns: () => void;
  createCheckIn: (checkIn: CheckIn) => Promise<void>;
  updateCheckIn: (checkIn: CheckIn) => Promise<void>;
  deleteCheckIn: (id: string, petId: string) => Promise<void>;
  clearError: () => void;
};

export const useCheckInStore = create<CheckInState>((set, get) => ({
  latestCheckIn: null,
  checkIns: [],
  isLoading: false,
  error: null,

  loadLatestCheckIn: async (petId) => {
    set({ isLoading: true, error: null });

    try {
      const latestCheckIn = await checkInStorage.getLatestCheckInByPetId(petId);
      set({ latestCheckIn, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getStoreErrorKey(error, 'errors.loadLatestCheckIn'),
      });
    }
  },

  loadCheckIns: async (petId) => {
    const hasCachedData = get().checkIns.length > 0;
    set({ isLoading: !hasCachedData, error: null });

    try {
      const checkIns = await checkInStorage.getCheckInsByPetId(petId);
      const latestCheckIn = checkIns[0] ?? null;
      set({ checkIns, latestCheckIn, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getStoreErrorKey(error, 'errors.loadCheckIns'),
      });
    }
  },

  clearCheckIns: () => set({ checkIns: [], latestCheckIn: null, error: null }),

  createCheckIn: async (checkIn) => {
    const hasCachedData = get().checkIns.length > 0;
    set({ isLoading: !hasCachedData, error: null });

    try {
      await checkInStorage.createCheckIn(checkIn);

      const userId = getActiveUserId();
      if (userId) {
        try {
          await pushCheckIn(userId, checkIn, 'check_in_created');
        } catch (syncError) {
          console.warn('Failed to sync new check-in to cloud', syncError);
        }
      }

      const checkIns = await checkInStorage.getCheckInsByPetId(checkIn.petId);
      const latestCheckIn = checkIns[0] ?? null;

      set({ checkIns, latestCheckIn, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getStoreErrorKey(error, 'errors.createCheckIn'),
      });
      throw error;
    }
  },

  updateCheckIn: async (checkIn) => {
    const hasCachedData = get().checkIns.length > 0;
    set({ isLoading: !hasCachedData, error: null });

    try {
      await checkInStorage.updateCheckIn(checkIn);

      const userId = getActiveUserId();
      if (userId) {
        try {
          await pushCheckIn(userId, checkIn);
        } catch (syncError) {
          console.warn('Failed to sync updated check-in to cloud', syncError);
        }
      }

      const checkIns = await checkInStorage.getCheckInsByPetId(checkIn.petId);
      const latestCheckIn = checkIns[0] ?? null;

      set({ checkIns, latestCheckIn, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getStoreErrorKey(error, 'errors.updateCheckIn'),
      });
      throw error;
    }
  },

  deleteCheckIn: async (id, petId) => {
    set({ isLoading: true, error: null });

    try {
      await checkInStorage.deleteCheckIn(id);

      if (getActiveUserId()) {
        try {
          await deleteRemoteCheckIn(id);
        } catch (syncError) {
          console.warn('Failed to delete check-in from cloud', syncError);
        }
      }

      const checkIns = get().checkIns.filter((checkIn) => checkIn.id !== id);
      const latestCheckIn = await checkInStorage.getLatestCheckInByPetId(petId);

      set({ checkIns, latestCheckIn, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getStoreErrorKey(error, 'errors.deleteCheckIn'),
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
