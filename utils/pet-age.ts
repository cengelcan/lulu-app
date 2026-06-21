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
