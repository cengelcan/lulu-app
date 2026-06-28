import { create } from 'zustand';

import {
  cancelCheckInReminder,
  syncCheckInReminderSchedule,
  syncPetReminderNotificationSchedule,
} from '@/services/notifications';
import { deletePetPhotoFiles, deleteRemotePet, pushPet } from '@/services/sync/pets-sync';
import { removeActivePetId } from '@/storage/prefs.storage';
import * as petStorage from '@/storage/pet.storage';
import { useCheckInStore } from '@/stores/check-in.store';
import { useUserStore } from '@/stores/user.store';
import type { Pet, PetStatus } from '@/types/pet';

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
  /** Load a specific pet for profile/edit. Active pets become the app context;
   *  deceased pets are shown read-only without changing the persisted active pet. */
  loadPetById: (id: string) => Promise<void>;
  setActivePet: (petId: string) => Promise<void>;
  createPet: (pet: Pet) => Promise<void>;
  updatePet: (pet: Pet) => Promise<void>;
  setPetStatus: (id: string, status: PetStatus) => Promise<void>;
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

  loadPetById: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const [pet, pets] = await Promise.all([petStorage.getPetById(id), petStorage.getPets()]);

      if (!pet) {
        throw new Error('Pet not found');
      }

      if (pet.status === 'deceased') {
        // Memorial view: show this pet without changing the persisted active pet.
        set({ pets, pet, isLoading: false });
        return;
      }

      const isSameActivePet = get().activePetId === id;

      if (!isSameActivePet) {
        useCheckInStore.getState().clearCheckIns();
        await petStorage.setActivePet(id);
      }

      set({ pets, pet, activePetId: pet.id, isLoading: false });

      if (!isSameActivePet) {
        await useCheckInStore.getState().loadCheckIns(pet.id);
        await syncCheckInReminderSchedule({ petName: pet.name });
        await syncPetReminderNotificationSchedule();
      }
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to load pet'),
      });
      throw error;
    }
  },

  setActivePet: async (petId) => {
    if (get().activePetId === petId) {
      return;
    }

    set({ error: null });
    useCheckInStore.getState().clearCheckIns();

    try {
      const pet = await petStorage.setActivePet(petId);
      set({ pet, activePetId: pet.id });
      await useCheckInStore.getState().loadCheckIns(pet.id);

      // Never schedule check-in reminders for a deceased pet (e.g. when opening
      // its memorial profile temporarily makes it the active context).
      if (pet.status === 'deceased') {
        await cancelCheckInReminder();
      } else {
        await syncCheckInReminderSchedule({ petName: pet.name });
      }
      await syncPetReminderNotificationSchedule();
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

  setPetStatus: async (id, status) => {
    set({ isLoading: true, error: null });

    try {
      const target = get().pets.find((entry) => entry.id === id) ?? get().pet;

      if (!target || target.id !== id) {
        throw new Error('Pet not found');
      }

      const updated: Pet = {
        ...target,
        status,
        deceasedAt:
          status === 'deceased' ? target.deceasedAt ?? new Date().toISOString() : null,
      };

      await petStorage.updatePet(updated);

      const userId = getActiveUserId();
      if (userId) {
        try {
          await pushPet(userId, updated);
        } catch (syncError) {
          console.warn('Failed to sync pet status to cloud', syncError);
        }
      }

      const pets = get().pets.map((entry) => (entry.id === id ? updated : entry));
      const wasActive = get().pet?.id === id;

      set({
        pets,
        pet: wasActive ? updated : get().pet,
        isLoading: false,
      });

      if (status === 'deceased' && wasActive) {
        // A deceased pet can't be the active context for new check-ins. Hand the
        // active slot to another living pet when one exists; otherwise just stop
        // its reminders and keep it as a read-only context.
        const nextActive = pets.find((entry) => entry.id !== id && entry.status === 'active');

        if (nextActive) {
          await get().setActivePet(nextActive.id);
        } else {
          await cancelCheckInReminder();
        }
      } else if (status === 'active' && wasActive) {
        await syncCheckInReminderSchedule({ petName: updated.name });
        await syncPetReminderNotificationSchedule();
      }
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Failed to update pet status'),
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
