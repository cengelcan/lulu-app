import type { Pet, PetSharingRole } from '@/types/pet';
import type { VetVisit } from '@/types/vet-visit';

export function getPetSharingRole(pet: Pick<Pet, 'sharingRole'>): PetSharingRole {
  return pet.sharingRole ?? 'owner';
}

export function isPetOwner(pet: Pick<Pet, 'sharingRole'>): boolean {
  return getPetSharingRole(pet) === 'owner';
}

export function isSharedPet(pet: Pick<Pet, 'sharingRole'>): boolean {
  return getPetSharingRole(pet) === 'member';
}

export function canEditPetProfile(pet: Pick<Pet, 'sharingRole'>): boolean {
  return isPetOwner(pet);
}

export function canDeletePet(pet: Pick<Pet, 'sharingRole'>): boolean {
  return isPetOwner(pet);
}

export function canManageFamilySharing(pet: Pick<Pet, 'sharingRole'>): boolean {
  return isPetOwner(pet);
}

export function canViewReports(pet: Pick<Pet, 'sharingRole'>): boolean {
  return isPetOwner(pet);
}

export function canWritePetCareData(pet: Pick<Pet, 'sharingRole' | 'status'>): boolean {
  return pet.status !== 'deceased';
}

/** Owners may manage every visit; family members may manage only visits they created. */
export function canWriteVetVisit(
  pet: Pick<Pet, 'sharingRole' | 'status'>,
  visit: Pick<VetVisit, 'createdByUserId'> | null | undefined,
  userId: string | null
): boolean {
  if (!canWritePetCareData(pet)) return false;
  if (isPetOwner(pet) || !visit) return true;
  return Boolean(userId && visit.createdByUserId === userId);
}
