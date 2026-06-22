import { create } from 'zustand';

import { deleteRemotePetRecord, pushPetRecord } from '@/services/sync/records-sync';
import * as petRecordStorage from '@/storage/pet-record.storage';
import { useUserStore } from '@/stores/user.store';
import type { PetRecord, RecordTypeId } from '@/types/pet-record';

function getActiveUserId(): string | null {
  return useUserStore.getState().userId;
}

type PetRecordState = {
  records: PetRecord[];
  isLoading: boolean;
  error: string | null;
  loadRecords: (petId: string) => Promise<void>;
  loadRecordsByType: (petId: string, type: RecordTypeId) => Promise<void>;
  clearRecords: () => void;
  createRecord: (record: PetRecord) => Promise<void>;
  updateRecord: (record: PetRecord) => Promise<void>;
  deleteRecord: (id: string, petId: string) => Promise<void>;
  clearError: () => void;
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export const usePetRecordStore = create<PetRecordState>((set, get) => ({
  records: [],
  isLoading: false,
  error: null,

  loadRecords: async (petId) => {
    const hasCachedData = get().records.length > 0;
    set({ isLoading: !hasCachedData, error: null });

    try {
      const records = await petRecordStorage.getPetRecordsByPetId(petId);
      set({ records, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to load records'),
      });
    }
  },

  loadRecordsByType: async (petId, type) => {
    set({ isLoading: true, error: null });

    try {
      const records = await petRecordStorage.getPetRecordsByPetIdAndType(petId, type);
      set({ records, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to load records'),
      });
    }
  },

  clearRecords: () => set({ records: [], error: null }),

  createRecord: async (record) => {
    const hasCachedData = get().records.length > 0;
    set({ isLoading: !hasCachedData, error: null });

    try {
      await petRecordStorage.createPetRecord(record);

      const userId = getActiveUserId();
      if (userId) {
        try {
          await pushPetRecord(userId, record);
        } catch (syncError) {
          console.warn('Failed to sync new record to cloud', syncError);
        }
      }

      const records = await petRecordStorage.getPetRecordsByPetId(record.petId);
      set({ records, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to create record'),
      });
      throw error;
    }
  },

  updateRecord: async (record) => {
    const hasCachedData = get().records.length > 0;
    set({ isLoading: !hasCachedData, error: null });

    try {
      await petRecordStorage.updatePetRecord(record);

      const userId = getActiveUserId();
      if (userId) {
        try {
          await pushPetRecord(userId, record);
        } catch (syncError) {
          console.warn('Failed to sync updated record to cloud', syncError);
        }
      }

      const records = await petRecordStorage.getPetRecordsByPetId(record.petId);
      set({ records, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to update record'),
      });
      throw error;
    }
  },

  deleteRecord: async (id, _petId) => {
    set({ isLoading: true, error: null });

    try {
      await petRecordStorage.deletePetRecord(id);

      if (getActiveUserId()) {
        try {
          await deleteRemotePetRecord(id);
        } catch (syncError) {
          console.warn('Failed to delete record from cloud', syncError);
        }
      }

      const records = get().records.filter((record) => record.id !== id);
      set({ records, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to delete record'),
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
