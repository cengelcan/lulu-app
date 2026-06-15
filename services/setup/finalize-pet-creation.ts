import type { Router } from 'expo-router';

import type { NotificationPermissionStatus } from '@/storage/prefs.storage';
import type { HealthCondition, Pet, PetAgeGroup, PetSpecies } from '@/types/pet';
import {
  validateAgeGroup,
  validatePetName,
  validateSpecies,
} from '@/stores/setup.store';

export type SetupDraft = {
  species: PetSpecies | null;
  breed: string | null;
  name: string;
  ageGroup: PetAgeGroup | null;
  healthConditions: HealthCondition[];
};

export function createPetId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function validateSetupDraft(draft: SetupDraft): string | null {
  return (
    validatePetName(draft.name) ??
    validateSpecies(draft.species) ??
    validateAgeGroup(draft.ageGroup)
  );
}

function buildPetFromDraft(draft: SetupDraft): Pet {
  const validationError = validateSetupDraft(draft);
  if (validationError) {
    throw new Error(validationError);
  }

  return {
    id: createPetId(),
    name: draft.name.trim(),
    species: draft.species!,
    breed: draft.breed,
    ageGroup: draft.ageGroup!,
    healthConditions: draft.healthConditions.length > 0 ? draft.healthConditions : ['none'],
    createdAt: new Date().toISOString(),
  };
}

type FinalizeAddModePetDeps = {
  createPet: (pet: Pet) => Promise<void>;
  setActivePet: (petId: string) => Promise<void>;
  loadCheckIns: (petId: string) => Promise<void>;
  resetDraft: () => void;
  router: Router;
};

type FinalizeInitialModePetDeps = {
  createPet: (pet: Pet) => Promise<void>;
  setActivePet: (petId: string) => Promise<void>;
  savePermission: (permission: NotificationPermissionStatus) => Promise<NotificationPermissionStatus>;
  resetDraft: () => void;
  router: Router;
};

export async function finalizeAddModePet(
  draft: SetupDraft,
  deps: FinalizeAddModePetDeps
): Promise<void> {
  const pet = buildPetFromDraft(draft);

  await deps.createPet(pet);
  await deps.setActivePet(pet.id);
  await deps.loadCheckIns(pet.id);

  deps.resetDraft();
  deps.router.dismissTo('/(tabs)/home');
}

export async function finalizeInitialModePet(
  draft: SetupDraft,
  permission: NotificationPermissionStatus,
  deps: FinalizeInitialModePetDeps
): Promise<NotificationPermissionStatus> {
  const pet = buildPetFromDraft(draft);
  const resolvedPermission = await deps.savePermission(permission);

  await deps.createPet(pet);
  await deps.setActivePet(pet.id);

  deps.resetDraft();
  deps.router.dismissTo('/(tabs)/home');

  return resolvedPermission;
}
