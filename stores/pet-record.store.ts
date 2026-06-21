import { create } from 'zustand';

import * as petRecordStorage from '@/storage/pet-record.storage';
import type { PetRecord, RecordTypeId } from '@/types/pet-record';

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
