import type { PetAgeGroup } from '@/types/pet';
import { parseLocalDate } from '@/utils/date';

export type PetAgeParts = {
  years: number;
  months: number;
};

export function getPetAgeParts(
  birthDate: string,
  referenceDate: Date = new Date()
): PetAgeParts | null {
  const birth = parseLocalDate(birthDate);
  if (!birth) {
    return null;
  }

  let years = referenceDate.getFullYear() - birth.getFullYear();
  let months = referenceDate.getMonth() - birth.getMonth();

  if (referenceDate.getDate() < birth.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) {
    return null;
  }

  return { years, months };
}

export function formatPetAgeFromBirthDate(
  birthDate: string,
  referenceDate: Date = new Date()
): string | null {
  const parts = getPetAgeParts(birthDate, referenceDate);
  if (!parts) {
    return null;
  }

  const { years, months } = parts;

  if (years === 0) {
    return `${months}mo`;
  }

  if (months === 0) {
    return `${years}y`;
  }

  return `${years}y ${months}mo`;
}

export function derivePetAgeGroupFromBirthDate(
  birthDate: string,
  referenceDate: Date = new Date()
): PetAgeGroup | null {
  const parts = getPetAgeParts(birthDate, referenceDate);
  if (!parts) {
    return null;
  }

  const totalMonths = parts.years * 12 + parts.months;

  if (totalMonths < 12) {
    return 'under_1_year';
  }

  if (parts.years <= 3) {
    return '1_3_years';
  }

  if (parts.years <= 7) {
    return '4_7_years';
  }

  if (parts.years <= 12) {
    return '8_12_years';
  }

  return '13_plus_years';
}

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function formatSetupPetAgeHint(
  birthDate: string,
  petName: string,
  t: TranslateFn
): string | null {
  const parts = getPetAgeParts(birthDate);
  if (!parts) {
    return null;
  }

  const name = petName.trim() || t('setup.petAgeHealth.ageHintFallbackName');
  const { years, months } = parts;

  if (years === 0 && months === 0) {
    return t('setup.petAgeHealth.ageHintNewborn', { name });
  }

  if (years === 0) {
    if (months === 1) {
      return t('setup.petAgeHealth.ageHintOneMonth', { name });
    }

    return t('setup.petAgeHealth.ageHintMonths', { name, months });
  }

  if (months === 0) {
    if (years === 1) {
      return t('setup.petAgeHealth.ageHintOneYear', { name });
    }

    return t('setup.petAgeHealth.ageHintYears', { name, years });
  }

  return t('setup.petAgeHealth.ageHintYearsMonths', { name, years, months });
}
