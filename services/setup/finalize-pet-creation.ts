import type { Router } from 'expo-router';

import { syncOwnedLocalPetsToCloud, uploadPetPhoto } from '@/services/sync/pets-sync';
import { requireAuthenticatedUserId } from '@/services/sync/require-authenticated-user-id';
import type { NotificationPermissionStatus } from '@/storage/prefs.storage';
import type { HealthCondition, Pet, PetSpecies } from '@/types/pet';
import { derivePetAgeGroupFromBirthDate } from '@/utils/pet-age';
import {
  validateBirthDate,
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
  birthDate: string;
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
    validateBirthDate(draft.birthDate)
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
    ageGroup: derivePetAgeGroupFromBirthDate(draft.birthDate)!,
    healthConditions: draft.healthConditions.length > 0 ? draft.healthConditions : ['none'],
    birthDate: draft.birthDate.trim(),
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
  let userId: string | null = null;

  try {
    userId = await requireAuthenticatedUserId();
  } catch {
    // Photo upload and cloud sync require auth; local createPet still runs below.
  }

  await createPet(pet);

  if (!draft.photoUri) {
    await syncPetToCloudAfterSetup();
    return pet;
  }

  let nextPhotoUri = draft.photoUri;

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
    await syncPetToCloudAfterSetup();
    return petWithPhoto;
  }

  await syncPetToCloudAfterSetup();
  return pet;
}

async function syncPetToCloudAfterSetup(): Promise<void> {
  try {
    const userId = await requireAuthenticatedUserId();
    await syncOwnedLocalPetsToCloud(userId);
  } catch (syncError) {
    console.warn('Pet saved locally but cloud sync failed after setup', syncError);
  }
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
  deps.router.replace('/(setup)/setup-complete');

  return resolvedPermission;
}
