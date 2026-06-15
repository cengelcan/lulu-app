import type {
  HealthCondition,
  Pet,
  PetAgeGroup,
  PetSex,
  PetSpayNeuterStatus,
  PetSpecies,
} from '@/types/pet';

export type PetFormSnapshot = {
  name: string;
  species: PetSpecies;
  breed: string | null;
  ageGroup: PetAgeGroup;
  healthConditions: HealthCondition[];
  photoUri: string | null;
  color: string | null;
  sex: PetSex | null;
  spayNeuterStatus: PetSpayNeuterStatus | null;
  birthDate: string | null;
  adoptionDate: string | null;
  microchipId: string | null;
  ownerName: string | null;
};

function normalizeOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeOptionalDate(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeHealthConditions(conditions: HealthCondition[]): HealthCondition[] {
  return [...conditions].sort();
}

export function getPetFormSnapshot(pet: Pet): PetFormSnapshot {
  return {
    name: pet.name.trim(),
    species: pet.species,
    breed: pet.breed ?? null,
    ageGroup: pet.ageGroup,
    healthConditions: normalizeHealthConditions(pet.healthConditions),
    photoUri: pet.photoUri ?? null,
    color: pet.color ?? null,
    sex: pet.sex ?? null,
    spayNeuterStatus: pet.spayNeuterStatus ?? null,
    birthDate: pet.birthDate ?? null,
    adoptionDate: pet.adoptionDate ?? null,
    microchipId: pet.microchipId ?? null,
    ownerName: pet.ownerName ?? null,
  };
}

export function buildPetFormSnapshot(input: {
  name: string;
  species: PetSpecies;
  breed: string | null;
  ageGroup: PetAgeGroup;
  healthConditions: HealthCondition[];
  photoUri: string | null;
  color: string;
  sex: PetSex | null;
  spayNeuterStatus: PetSpayNeuterStatus | null;
  birthDate: string;
  adoptionDate: string;
  microchipId: string;
  ownerName: string;
}): PetFormSnapshot {
  return {
    name: input.name.trim(),
    species: input.species,
    breed: input.breed,
    ageGroup: input.ageGroup,
    healthConditions: normalizeHealthConditions(input.healthConditions),
    photoUri: input.photoUri,
    color: normalizeOptionalText(input.color),
    sex: input.sex,
    spayNeuterStatus: input.spayNeuterStatus,
    birthDate: normalizeOptionalDate(input.birthDate),
    adoptionDate: normalizeOptionalDate(input.adoptionDate),
    microchipId: normalizeOptionalText(input.microchipId),
    ownerName: normalizeOptionalText(input.ownerName),
  };
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((value, index) => value === b[index]);
}

export function arePetFormSnapshotsEqual(a: PetFormSnapshot, b: PetFormSnapshot): boolean {
  return (
    a.name === b.name &&
    a.species === b.species &&
    a.breed === b.breed &&
    a.ageGroup === b.ageGroup &&
    arraysEqual(a.healthConditions, b.healthConditions) &&
    a.photoUri === b.photoUri &&
    a.color === b.color &&
    a.sex === b.sex &&
    a.spayNeuterStatus === b.spayNeuterStatus &&
    a.birthDate === b.birthDate &&
    a.adoptionDate === b.adoptionDate &&
    a.microchipId === b.microchipId &&
    a.ownerName === b.ownerName
  );
}
