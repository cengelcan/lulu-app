import {
  HEALTH_CONDITION_OPTIONS,
  PET_SEX_OPTIONS,
  PET_SPAY_NEUTER_STATUS_OPTIONS,
  PET_SPECIES_OPTIONS,
} from '@/constants/check-in';
import type { HealthCondition, PetSex, PetSpayNeuterStatus, PetSpecies } from '@/types/pet';
import { formatCheckInTitleDate } from '@/utils/date';

export const PET_FIELD_NOT_SET = 'Not set';

function getOptionLabel<T extends string>(
  options: { value: T; label: string }[],
  value: T | null | undefined
): string {
  if (!value) {
    return PET_FIELD_NOT_SET;
  }

  return options.find((option) => option.value === value)?.label ?? value;
}

export function displayPetText(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : PET_FIELD_NOT_SET;
}

export function displayPetSpecies(species: PetSpecies): string {
  return getOptionLabel(PET_SPECIES_OPTIONS, species);
}

export function displayPetSex(sex: PetSex | null | undefined): string {
  return getOptionLabel(PET_SEX_OPTIONS, sex);
}

export function displayPetSpayNeuterStatus(
  status: PetSpayNeuterStatus | null | undefined
): string {
  return getOptionLabel(PET_SPAY_NEUTER_STATUS_OPTIONS, status);
}

export function displayPetDate(date: string | null | undefined): string {
  const trimmed = date?.trim();
  if (!trimmed) {
    return PET_FIELD_NOT_SET;
  }

  return formatCheckInTitleDate(trimmed);
}

export function displayHealthConditions(conditions: HealthCondition[]): string {
  if (conditions.length === 0 || (conditions.length === 1 && conditions[0] === 'none')) {
    return 'None';
  }

  return conditions
    .map((condition) => getOptionLabel(HEALTH_CONDITION_OPTIONS, condition))
    .join(', ');
}
