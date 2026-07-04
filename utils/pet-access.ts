import type { Pet, PetSharingRole } from '@/types/pet';

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
