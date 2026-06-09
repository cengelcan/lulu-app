import type { HealthCondition, Pet, PetAgeGroup, PetSpecies } from '@/types/pet';

import { getDatabase } from './database';

type PetRow = {
  id: string;
  name: string;
  species: string;
  age_group: string;
  health_conditions: string;
  photo_uri: string | null;
  created_at: string;
};

function mapPetRow(row: PetRow): Pet {
  return {
    id: row.id,
    name: row.name,
    species: row.species as PetSpecies,
    ageGroup: row.age_group as PetAgeGroup,
    healthConditions: JSON.parse(row.health_conditions) as HealthCondition[],
    photoUri: row.photo_uri,
    createdAt: row.created_at,
  };
}

export async function createPet(pet: Pet): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT INTO pets (id, name, species, age_group, health_conditions, photo_uri, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    pet.id,
    pet.name,
    pet.species,
    pet.ageGroup,
    JSON.stringify(pet.healthConditions),
    pet.photoUri ?? null,
    pet.createdAt
  );
}

export async function getPetById(id: string): Promise<Pet | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<PetRow>('SELECT * FROM pets WHERE id = ?', id);

  return row ? mapPetRow(row) : null;
}

/** Returns the single pet profile (MVP supports one pet per user). */
export async function getPet(): Promise<Pet | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<PetRow>(
    'SELECT * FROM pets ORDER BY created_at ASC LIMIT 1'
  );

  return row ? mapPetRow(row) : null;
}

export async function updatePet(pet: Pet): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `UPDATE pets
     SET name = ?, species = ?, age_group = ?, health_conditions = ?, photo_uri = ?
     WHERE id = ?`,
    pet.name,
    pet.species,
    pet.ageGroup,
    JSON.stringify(pet.healthConditions),
    pet.photoUri ?? null,
    pet.id
  );
}

export async function deletePet(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM pets WHERE id = ?', id);
}
