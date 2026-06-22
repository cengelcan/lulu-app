import { create } from 'zustand';

import { syncCheckInReminderSchedule } from '@/services/notifications/schedule';
import { deletePetPhotoFiles, deleteRemotePet, pushPet } from '@/services/sync/pets-sync';
import { removeActivePetId } from '@/storage/prefs.storage';
import * as petStorage from '@/storage/pet.storage';
import { useCheckInStore } from '@/stores/check-in.store';
import { useUserStore } from '@/stores/user.store';
import type { Pet } from '@/types/pet';

function getActiveUserId(): string | null {
  return useUserStore.getState().userId;
}

type PetState = {
  pets: Pet[];
  pet: Pet | null;
  activePetId: string | null;
  isLoading: boolean;
  error: string | null;
  loadPet: () => Promise<void>;
  loadPets: () => Promise<void>;
  setActivePet: (petId: string) => Promise<void>;
  createPet: (pet: Pet) => Promise<void>;
  updatePet: (pet: Pet) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
  clearError: () => void;
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  pet: null,
  activePetId: null,
  isLoading: false,
  error: null,

  loadPets: async () => {
    const hasCachedPet = get().pet !== null;
    set({ isLoading: !hasCachedPet, error: null });

    try {
      const [pets, activePet] = await Promise.all([
        petStorage.getPets(),
        petStorage.getActivePet(),
      ]);

      set({
        pets,
        pet: activePet,
        activePetId: activePet?.id ?? null,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to load pets'),
      });
    }
  },

  loadPet: async () => {
    await get().loadPets();
  },

  setActivePet: async (petId) => {
    set({ error: null });
    useCheckInStore.getState().clearCheckIns();

    try {
      const pet = await petStorage.setActivePet(petId);
      set({ pet, activePetId: pet.id });
      await syncCheckInReminderSchedule({ petName: pet.name });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to switch pet') });
      throw error;
    }
  },

  createPet: async (pet) => {
    set({ isLoading: true, error: null });

    try {
      await petStorage.createPet(pet);

      const userId = getActiveUserId();
      if (userId) {
        try {
          await pushPet(userId, pet);
        } catch (syncError) {
          console.warn('Failed to sync new pet to cloud', syncError);
        }
      }

      set((state) => ({
        pets: [...state.pets, pet],
        pet,
        isLoading: false,
      }));
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

      const userId = getActiveUserId();
      if (userId) {
        try {
          await pushPet(userId, pet);
        } catch (syncError) {
          console.warn('Failed to sync updated pet to cloud', syncError);
        }
      }

      set((state) => ({
        pet: state.pet?.id === pet.id ? pet : state.pet,
        pets: state.pets.map((entry) => (entry.id === pet.id ? pet : entry)),
        isLoading: false,
      }));
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
      const wasActive = get().pet?.id === id;
      await petStorage.deletePet(id);

      const userId = getActiveUserId();
      if (userId) {
        try {
          await deleteRemotePet(id);
        } catch (syncError) {
          console.warn('Failed to delete pet from cloud', syncError);
        }

        try {
          await deletePetPhotoFiles(userId, id);
        } catch (syncError) {
          console.warn('Failed to delete pet photo from cloud', syncError);
        }
      }

      const remainingPets = get().pets.filter((entry) => entry.id !== id);

      if (remainingPets.length === 0) {
        await removeActivePetId();
        set({ pets: [], pet: null, activePetId: null, isLoading: false });
        return;
      }

      set({ pets: remainingPets, isLoading: false });

      if (wasActive) {
        await get().setActivePet(remainingPets[0].id);
      }
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
