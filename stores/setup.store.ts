import { create } from 'zustand';

import { isBreedValidForSpecies } from '@/constants/pet-breeds';
import { isValidLocalDateString } from '@/utils/date';

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
  species: PetSpecies | null;
  breed: string | null;
  name: string;
  ageGroup: PetAgeGroup | null;
  healthConditions: HealthCondition[];
  photoUri: string | null;
  photoUpload: { base64: string; mimeType: string } | null;
  setSpecies: (species: PetSpecies) => void;
  setBreed: (breed: string | null) => void;
  setName: (name: string) => void;
  setAgeGroup: (ageGroup: PetAgeGroup) => void;
  toggleHealthCondition: (condition: HealthCondition) => void;
  setPhoto: (uri: string | null, upload?: { base64: string; mimeType: string } | null) => void;
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
  species: null,
  breed: null as string | null,
  name: '',
  ageGroup: null,
  healthConditions: [] as HealthCondition[],
  photoUri: null as string | null,
  photoUpload: null as { base64: string; mimeType: string } | null,
};

export const useSetupStore = create<SetupDraftState>((set, get) => ({
  ...initialDraft,

  setSpecies: (species) => {
    const { breed } = get();
    const nextBreed = breed && !isBreedValidForSpecies(breed, species) ? null : breed;
    set({ species, breed: nextBreed });
  },

  setBreed: (breed) => set({ breed }),

  setName: (name) => set({ name }),

  setAgeGroup: (ageGroup) => set({ ageGroup }),

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

  setPhoto: (uri, upload = null) => set({ photoUri: uri, photoUpload: upload ?? null }),

  resetDraft: () => set(initialDraft),
}));
