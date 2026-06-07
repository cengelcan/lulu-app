import { create } from 'zustand';

import * as checkInStorage from '@/storage/check-in.storage';
import type { CheckIn } from '@/types/check-in';

type CheckInState = {
  latestCheckIn: CheckIn | null;
  checkIns: CheckIn[];
  isLoading: boolean;
  error: string | null;
  loadLatestCheckIn: (petId: string) => Promise<void>;
  loadCheckIns: (petId: string) => Promise<void>;
  createCheckIn: (checkIn: CheckIn) => Promise<void>;
  updateCheckIn: (checkIn: CheckIn) => Promise<void>;
  deleteCheckIn: (id: string, petId: string) => Promise<void>;
  clearError: () => void;
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

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
        error: getErrorMessage(error, 'Failed to load latest check-in'),
      });
    }
  },

  loadCheckIns: async (petId) => {
    set({ isLoading: true, error: null });

    try {
      const checkIns = await checkInStorage.getCheckInsByPetId(petId);
      const latestCheckIn = checkIns[0] ?? null;
      set({ checkIns, latestCheckIn, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to load check-ins'),
      });
    }
  },

  createCheckIn: async (checkIn) => {
    set({ isLoading: true, error: null });

    try {
      await checkInStorage.createCheckIn(checkIn);

      const checkIns = await checkInStorage.getCheckInsByPetId(checkIn.petId);
      const latestCheckIn = checkIns[0] ?? null;

      set({ checkIns, latestCheckIn, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to create check-in'),
      });
      throw error;
    }
  },

  updateCheckIn: async (checkIn) => {
    set({ isLoading: true, error: null });

    try {
      await checkInStorage.updateCheckIn(checkIn);

      const checkIns = await checkInStorage.getCheckInsByPetId(checkIn.petId);
      const latestCheckIn = checkIns[0] ?? null;

      set({ checkIns, latestCheckIn, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to update check-in'),
      });
      throw error;
    }
  },

  deleteCheckIn: async (id, petId) => {
    set({ isLoading: true, error: null });

    try {
      await checkInStorage.deleteCheckIn(id);

      const checkIns = get().checkIns.filter((checkIn) => checkIn.id !== id);
      const latestCheckIn = await checkInStorage.getLatestCheckInByPetId(petId);

      set({ checkIns, latestCheckIn, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to delete check-in'),
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
