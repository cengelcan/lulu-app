import { decode } from 'base64-arraybuffer';

import { supabase } from '@/lib/supabase';
import * as petStorage from '@/storage/pet.storage';
import type {
  HealthCondition,
  Pet,
  PetAgeGroup,
  PetSex,
  PetSpayNeuterStatus,
  PetSpecies,
  PetStatus,
} from '@/types/pet';

const PET_PHOTO_BUCKET = 'pet-photos';

function extensionForMimeType(mimeType: string | null): string {
  if (!mimeType) {
    return 'jpg';
  }

  const subtype = mimeType.split('/')[1]?.toLowerCase();

  if (!subtype) {
    return 'jpg';
  }

  return subtype === 'jpeg' ? 'jpg' : subtype;
}

type RemotePetRow = {
  id: string;
  user_id: string;
  name: string;
  species: string;
  breed: string | null;
  age_group: string;
  health_conditions: HealthCondition[] | null;
  photo_uri: string | null;
  color: string | null;
  sex: string | null;
  spay_neuter_status: string | null;
  birth_date: string | null;
  adoption_date: string | null;
  microchip_id: string | null;
  owner_name: string | null;
  status: string | null;
  deceased_at: string | null;
  created_at: string;
};

function toRemoteRow(pet: Pet, userId: string): Record<string, unknown> {
  return {
    id: pet.id,
    user_id: userId,
    name: pet.name,
    species: pet.species,
    breed: pet.breed ?? null,
    age_group: pet.ageGroup,
    health_conditions: pet.healthConditions,
    photo_uri: pet.photoUri ?? null,
    color: pet.color ?? null,
    sex: pet.sex ?? null,
    spay_neuter_status: pet.spayNeuterStatus ?? null,
    birth_date: pet.birthDate ?? null,
    adoption_date: pet.adoptionDate ?? null,
    microchip_id: pet.microchipId ?? null,
    owner_name: pet.ownerName ?? null,
    status: pet.status ?? 'active',
    deceased_at: pet.deceasedAt ?? null,
    created_at: pet.createdAt,
  };
}

function fromRemoteRow(row: RemotePetRow): Pet {
  return {
    id: row.id,
    name: row.name,
    species: row.species as PetSpecies,
    breed: row.breed,
    ageGroup: row.age_group as PetAgeGroup,
    healthConditions: row.health_conditions ?? [],
    photoUri: row.photo_uri,
    color: row.color,
    sex: row.sex as PetSex | null,
    spayNeuterStatus: row.spay_neuter_status as PetSpayNeuterStatus | null,
    birthDate: row.birth_date,
    adoptionDate: row.adoption_date,
    microchipId: row.microchip_id,
    ownerName: row.owner_name,
    status: (row.status as PetStatus | null) ?? 'active',
    deceasedAt: row.deceased_at,
    createdAt: row.created_at,
  };
}

export async function fetchRemotePets(userId: string): Promise<Pet[]> {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as RemotePetRow[]).map(fromRemoteRow);
}

export async function pushPet(userId: string, pet: Pet): Promise<void> {
  const { error } = await supabase.from('pets').upsert(toRemoteRow(pet, userId), {
    onConflict: 'id',
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteRemotePet(id: string): Promise<void> {
  const { error } = await supabase.from('pets').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Uploads a pet photo (base64 image bytes) to Supabase Storage and returns a
 * public, cache-busted URL. The file is stored under the owner's folder so the
 * storage RLS policy permits the write (mirrors the avatar upload pattern).
 */
export async function uploadPetPhoto(
  userId: string,
  petId: string,
  base64: string,
  mimeType: string | null
): Promise<string> {
  const extension = extensionForMimeType(mimeType);
  const path = `${userId}/${petId}.${extension}`;
  const contentType = mimeType ?? 'image/jpeg';

  const { error } = await supabase.storage
    .from(PET_PHOTO_BUCKET)
    .upload(path, decode(base64), { contentType, upsert: true });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(PET_PHOTO_BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

/**
 * Removes pet photo files from Storage. Storage objects are not covered by the
 * pets FK cascade, so they must be deleted via the Storage API. Pass a petId to
 * remove a single pet's photo, or omit it to clear the whole user folder (used
 * during account deletion). Best-effort: a missing folder is not an error.
 */
export async function deletePetPhotoFiles(userId: string, petId?: string): Promise<void> {
  const { data, error: listError } = await supabase.storage.from(PET_PHOTO_BUCKET).list(userId);

  if (listError) {
    throw new Error(listError.message);
  }

  if (!data || data.length === 0) {
    return;
  }

  const targets = petId ? data.filter((file) => file.name.startsWith(`${petId}.`)) : data;

  if (targets.length === 0) {
    return;
  }

  const paths = targets.map((file) => `${userId}/${file.name}`);
  const { error: removeError } = await supabase.storage.from(PET_PHOTO_BUCKET).remove(paths);

  if (removeError) {
    throw new Error(removeError.message);
  }
}

/**
 * Reconciles local pets with Supabase (the source of truth) and returns the result.
 *
 * Transition case: when the cloud has no pets yet but the device has local pets,
 * those local pets are pushed up (claimed for this user) instead of being wiped.
 * Otherwise the local cache is replaced with the cloud pets.
 */
export async function pullPetsIntoLocal(userId: string): Promise<Pet[]> {
  const remotePets = await fetchRemotePets(userId);

  if (remotePets.length === 0) {
    const localPets = await petStorage.getPets();

    if (localPets.length > 0) {
      for (const pet of localPets) {
        await pushPet(userId, pet);
      }

      return localPets;
    }

    return [];
  }

  await petStorage.deleteAllPets();
  for (const pet of remotePets) {
    await petStorage.createPet(pet);
  }

  return remotePets;
}
