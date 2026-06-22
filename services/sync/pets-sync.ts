import { supabase } from '@/lib/supabase';
import * as petStorage from '@/storage/pet.storage';
import type {
  HealthCondition,
  Pet,
  PetAgeGroup,
  PetSex,
  PetSpayNeuterStatus,
  PetSpecies,
} from '@/types/pet';

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
