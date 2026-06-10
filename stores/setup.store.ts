import { create } from 'zustand';

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
  name: string;
  ageGroup: PetAgeGroup | null;
  healthConditions: HealthCondition[];
  setSpecies: (species: PetSpecies) => void;
  setName: (name: string) => void;
  setAgeGroup: (ageGroup: PetAgeGroup) => void;
  toggleHealthCondition: (condition: HealthCondition) => void;
  resetDraft: () => void;
};

export function validatePetName(name: string): string | null {
  const trimmed = name.trim();

  if (trimmed.length < PET_NAME_MIN_LENGTH) {
    return 'Pet name is required';
  }

  if (trimmed.length > PET_NAME_MAX_LENGTH) {
    return `Pet name must be ${PET_NAME_MAX_LENGTH} characters or less`;
  }

  return null;
}

export function validateSpecies(species: PetSpecies | null): string | null {
  if (!species) {
    return 'Please select a pet type';
  }

  return null;
}

export function validateAgeGroup(ageGroup: PetAgeGroup | null): string | null {
  if (!ageGroup) {
    return 'Please select an age group';
  }

  return null;
}

export function validateOptionalPetDate(date: string): string | null {
  const trimmed = date.trim();

  if (!trimmed) {
    return null;
  }

  if (!isValidLocalDateString(trimmed)) {
    return 'Enter a valid date as YYYY-MM-DD';
  }

  return null;
}

export function validateOptionalColor(color: string): string | null {
  const trimmed = color.trim();

  if (trimmed.length > PET_COLOR_MAX_LENGTH) {
    return `Color must be ${PET_COLOR_MAX_LENGTH} characters or less`;
  }

  return null;
}

export function validateOptionalOwnerName(ownerName: string): string | null {
  const trimmed = ownerName.trim();

  if (trimmed.length > PET_OWNER_MAX_LENGTH) {
    return `Owner name must be ${PET_OWNER_MAX_LENGTH} characters or less`;
  }

  return null;
}

export function validateOptionalMicrochipId(microchipId: string): string | null {
  const trimmed = microchipId.trim();

  if (trimmed.length > PET_MICROCHIP_MAX_LENGTH) {
    return `Microchip ID must be ${PET_MICROCHIP_MAX_LENGTH} characters or less`;
  }

  return null;
}

const initialDraft = {
  species: null,
  name: '',
  ageGroup: null,
  healthConditions: [] as HealthCondition[],
};

export const useSetupStore = create<SetupDraftState>((set, get) => ({
  ...initialDraft,

  setSpecies: (species) => set({ species }),

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

  resetDraft: () => set(initialDraft),
}));
