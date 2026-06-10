import { create } from 'zustand';

import * as petStorage from '@/storage/pet.storage';
import type { Pet } from '@/types/pet';

type PetState = {
  pet: Pet | null;
  isLoading: boolean;
  error: string | null;
  loadPet: () => Promise<void>;
  setActivePet: (petId: string) => Promise<void>;
  createPet: (pet: Pet) => Promise<void>;
  updatePet: (pet: Pet) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
  clearError: () => void;
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export const usePetStore = create<PetState>((set) => ({
  pet: null,
  isLoading: false,
  error: null,

  loadPet: async () => {
    set({ isLoading: true, error: null });

    try {
      const pet = await petStorage.getActivePet();
      set({ pet, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to load pet'),
      });
    }
  },

  setActivePet: async (petId) => {
    set({ error: null });

    try {
      const pet = await petStorage.setActivePet(petId);
      set({ pet });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to switch pet') });
      throw error;
    }
  },

  createPet: async (pet) => {
    set({ isLoading: true, error: null });

    try {
      await petStorage.createPet(pet);
      set({ pet, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to create pet'),
      });
      throw error;
    }
  },

  updatePet: async (pet) => {
    set({ isLoading: true, error: null });

    try {
      await petStorage.updatePet(pet);
      set({ pet, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to update pet'),
      });
      throw error;
    }
  },

  deletePet: async (id) => {
    set({ isLoading: true, error: null });

    try {
      await petStorage.deletePet(id);
      set({ pet: null, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to delete pet'),
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
