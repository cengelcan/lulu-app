import { create } from 'zustand';

import {
  PET_NAME_MAX_LENGTH,
  PET_NAME_MIN_LENGTH,
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
