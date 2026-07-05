import * as petStorage from '@/storage/pet.storage';

/** Pet IDs the current user owns locally (excludes shared/member pets). */
export async function getLocalOwnedPetIds(): Promise<Set<string>> {
  const localPets = await petStorage.getPets();

  return new Set(
    localPets
      .filter((pet) => (pet.sharingRole ?? 'owner') === 'owner')
      .map((pet) => pet.id)
  );
}
