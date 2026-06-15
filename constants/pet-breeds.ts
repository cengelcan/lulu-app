import type { PetSpecies } from '@/types/pet';

export type PetBreed =
  | 'turkish_van'
  | 'turkish_angora'
  | 'british_shorthair'
  | 'persian'
  | 'siamese'
  | 'maine_coon'
  | 'scottish_fold'
  | 'domestic_shorthair'
  | 'golden_retriever'
  | 'labrador_retriever'
  | 'german_shepherd'
  | 'kangal'
  | 'poodle'
  | 'beagle'
  | 'husky'
  | 'chihuahua'
  | 'mixed'
  | 'other'
  | 'unknown';

type BreedOption = {
  value: PetBreed;
  label: string;
};

export const CAT_BREED_OPTIONS: BreedOption[] = [
  { value: 'turkish_van', label: 'Turkish Van' },
  { value: 'turkish_angora', label: 'Turkish Angora' },
  { value: 'british_shorthair', label: 'British Shorthair' },
  { value: 'persian', label: 'Persian' },
  { value: 'siamese', label: 'Siamese' },
  { value: 'maine_coon', label: 'Maine Coon' },
  { value: 'scottish_fold', label: 'Scottish Fold' },
  { value: 'domestic_shorthair', label: 'Domestic Shorthair' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Unknown' },
];

export const DOG_BREED_OPTIONS: BreedOption[] = [
  { value: 'golden_retriever', label: 'Golden Retriever' },
  { value: 'labrador_retriever', label: 'Labrador Retriever' },
  { value: 'german_shepherd', label: 'German Shepherd' },
  { value: 'kangal', label: 'Kangal' },
  { value: 'poodle', label: 'Poodle' },
  { value: 'beagle', label: 'Beagle' },
  { value: 'husky', label: 'Husky' },
  { value: 'chihuahua', label: 'Chihuahua' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Unknown' },
];

const BREED_OPTIONS_BY_SPECIES: Record<PetSpecies, BreedOption[]> = {
  cat: CAT_BREED_OPTIONS,
  dog: DOG_BREED_OPTIONS,
};

export function getBreedOptionsForSpecies(species: PetSpecies): BreedOption[] {
  return BREED_OPTIONS_BY_SPECIES[species];
}

export function getBreedLabel(
  breed: string | null | undefined,
  species?: PetSpecies | null
): string | null {
  if (!breed) {
    return null;
  }

  const options = species ? getBreedOptionsForSpecies(species) : [...CAT_BREED_OPTIONS, ...DOG_BREED_OPTIONS];
  return options.find((option) => option.value === breed)?.label ?? breed;
}

export function isBreedValidForSpecies(breed: string, species: PetSpecies): boolean {
  return getBreedOptionsForSpecies(species).some((option) => option.value === breed);
}
