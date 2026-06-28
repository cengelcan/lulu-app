import { create } from 'zustand';

import { isBreedValidForSpecies } from '@/constants/pet-breeds';
import type { SetupMode } from '@/types/setup';
import { isValidLocalDateString } from '@/utils/date';
import { getPetAgeParts } from '@/utils/pet-age';

import {
  PET_COLOR_MAX_LENGTH,
  PET_MICROCHIP_MAX_LENGTH,
  PET_NAME_MAX_LENGTH,
  PET_NAME_MIN_LENGTH,
  PET_OWNER_MAX_LENGTH,
  type HealthCondition,
  type PetAgeGroup,
  type PetSpecies,
} from '@/types/pet';

type SetupDraftState = {
  setupMode: SetupMode;
  species: PetSpecies | null;
  breed: string | null;
  name: string;
  birthDate: string;
  healthConditions: HealthCondition[];
  photoUri: string | null;
  photoUpload: { base64: string; mimeType: string } | null;
  setSetupMode: (mode: SetupMode) => void;
  setSpecies: (species: PetSpecies) => void;
  setBreed: (breed: string | null) => void;
  setName: (name: string) => void;
  setBirthDate: (birthDate: string) => void;
  toggleHealthCondition: (condition: HealthCondition) => void;
  clearHealthConditions: () => void;
  setPhoto: (uri: string | null, upload?: { base64: string; mimeType: string } | null) => void;
  beginSetup: (mode: SetupMode) => void;
  resetDraft: () => void;
};

export function validatePetName(name: string): string | null {
  const trimmed = name.trim();

  if (trimmed.length < PET_NAME_MIN_LENGTH) {
    return 'pet.validation.nameRequired';
  }

  if (trimmed.length > PET_NAME_MAX_LENGTH) {
    return 'pet.validation.nameMaxLength';
  }

  return null;
}

export function validateSpecies(species: PetSpecies | null): string | null {
  if (!species) {
    return 'pet.validation.speciesRequired';
  }

  return null;
}

export function validateAgeGroup(ageGroup: PetAgeGroup | null): string | null {
  if (!ageGroup) {
    return 'pet.validation.ageGroupRequired';
  }

  return null;
}

export function validateBirthDate(birthDate: string): string | null {
  const trimmed = birthDate.trim();

  if (!trimmed) {
    return 'pet.validation.birthDateRequired';
  }

  if (!isValidLocalDateString(trimmed)) {
    return 'pet.validation.invalidDate';
  }

  if (!getPetAgeParts(trimmed)) {
    return 'pet.validation.invalidDate';
  }

  return null;
}

export function validateOptionalPetDate(date: string): string | null {
  const trimmed = date.trim();

  if (!trimmed) {
    return null;
  }

  if (!isValidLocalDateString(trimmed)) {
    return 'pet.validation.invalidDate';
  }

  return null;
}

export function validateOptionalColor(color: string): string | null {
  const trimmed = color.trim();

  if (trimmed.length > PET_COLOR_MAX_LENGTH) {
    return 'pet.validation.colorMaxLength';
  }

  return null;
}

export function validateOptionalOwnerName(ownerName: string): string | null {
  const trimmed = ownerName.trim();

  if (trimmed.length > PET_OWNER_MAX_LENGTH) {
    return 'pet.validation.ownerNameMaxLength';
  }

  return null;
}

export function validateOptionalMicrochipId(microchipId: string): string | null {
  const trimmed = microchipId.trim();

  if (trimmed.length > PET_MICROCHIP_MAX_LENGTH) {
    return 'pet.validation.microchipMaxLength';
  }

  return null;
}

const initialDraft = {
  setupMode: 'initial' as SetupMode,
  species: null,
  breed: null as string | null,
  name: '',
  birthDate: '',
  healthConditions: [] as HealthCondition[],
  photoUri: null as string | null,
  photoUpload: null as { base64: string; mimeType: string } | null,
};

export const useSetupStore = create<SetupDraftState>((set, get) => ({
  ...initialDraft,

  setSetupMode: (setupMode) => set({ setupMode }),

  beginSetup: (setupMode) => set({ ...initialDraft, setupMode }),

  setSpecies: (species) => {
    const { breed } = get();
    const nextBreed = breed && !isBreedValidForSpecies(breed, species) ? null : breed;
    set({ species, breed: nextBreed });
  },

  setBreed: (breed) => set({ breed }),

  setName: (name) => set({ name }),

  setBirthDate: (birthDate) => set({ birthDate }),

  toggleHealthCondition: (condition) => {
    const { healthConditions } = get();

    if (condition === 'none') {
      set({ healthConditions: ['none'] });
      return;
    }

    const withoutNone = healthConditions.filter((item) => item !== 'none');

    if (withoutNone.includes(condition)) {
      set({ healthConditions: withoutNone.filter((item) => item !== condition) });
      return;
    }

    set({ healthConditions: [...withoutNone, condition] });
  },

  clearHealthConditions: () => set({ healthConditions: [] }),

  setPhoto: (uri, upload = null) => set({ photoUri: uri, photoUpload: upload ?? null }),

  resetDraft: () => set((state) => ({ ...initialDraft, setupMode: state.setupMode })),
}));
