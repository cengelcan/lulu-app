import type { Router } from 'expo-router';

import { uploadPetPhoto } from '@/services/sync/pets-sync';
import type { NotificationPermissionStatus } from '@/storage/prefs.storage';
import { useUserStore } from '@/stores/user.store';
import type { HealthCondition, Pet, PetAgeGroup, PetSpecies } from '@/types/pet';
import {
  validateAgeGroup,
  validatePetName,
  validateSpecies,
} from '@/stores/setup.store';

export type SetupPhotoUpload = {
  base64: string;
  mimeType: string;
};

export type SetupDraft = {
  species: PetSpecies | null;
  breed: string | null;
  name: string;
  ageGroup: PetAgeGroup | null;
  healthConditions: HealthCondition[];
  photoUri?: string | null;
  photoUpload?: SetupPhotoUpload | null;
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
    photoUri: draft.photoUri ?? null,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
}

async function createPetWithPhoto(
  draft: SetupDraft,
  createPet: (pet: Pet) => Promise<void>,
  updatePet: (pet: Pet) => Promise<void>
): Promise<Pet> {
  const pet = buildPetFromDraft(draft);

  await createPet(pet);

  if (!draft.photoUri) {
    return pet;
  }

  let nextPhotoUri = draft.photoUri;
  const userId = useUserStore.getState().userId;

  if (userId && draft.photoUpload) {
    try {
      nextPhotoUri = await uploadPetPhoto(
        userId,
        pet.id,
        draft.photoUpload.base64,
        draft.photoUpload.mimeType
      );
    } catch (uploadError) {
      console.warn('Failed to upload pet photo during setup', uploadError);
    }
  }

  if (nextPhotoUri !== pet.photoUri) {
    const petWithPhoto = { ...pet, photoUri: nextPhotoUri };
    await updatePet(petWithPhoto);
    return petWithPhoto;
  }

  return pet;
}

type FinalizeAddModePetDeps = {
  createPet: (pet: Pet) => Promise<void>;
  updatePet: (pet: Pet) => Promise<void>;
  setActivePet: (petId: string) => Promise<void>;
  loadCheckIns: (petId: string) => Promise<void>;
  resetDraft: () => void;
  router: Router;
};

type FinalizeInitialModePetDeps = {
  createPet: (pet: Pet) => Promise<void>;
  updatePet: (pet: Pet) => Promise<void>;
  setActivePet: (petId: string) => Promise<void>;
  savePermission: (permission: NotificationPermissionStatus) => Promise<NotificationPermissionStatus>;
  resetDraft: () => void;
  router: Router;
};

export async function finalizeAddModePet(
  draft: SetupDraft,
  deps: FinalizeAddModePetDeps
): Promise<void> {
  const pet = await createPetWithPhoto(draft, deps.createPet, deps.updatePet);

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
  const resolvedPermission = await deps.savePermission(permission);
  const pet = await createPetWithPhoto(draft, deps.createPet, deps.updatePet);

  await deps.setActivePet(pet.id);

  deps.resetDraft();
  deps.router.dismissTo('/(tabs)/home');

  return resolvedPermission;
}
