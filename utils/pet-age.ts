import { parseLocalDate } from '@/utils/date';

export function formatPetAgeFromBirthDate(
  birthDate: string,
  referenceDate: Date = new Date()
): string | null {
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

  if (years === 0) {
    return `${months}mo`;
  }

  if (months === 0) {
    return `${years}y`;
  }

  return `${years}y ${months}mo`;
}
