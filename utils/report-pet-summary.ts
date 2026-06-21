import type { ReportPetSummary } from '@/types/report';
import type { Pet } from '@/types/pet';
import type { PetRecord } from '@/types/pet-record';
import { formatPetAgeFromBirthDate } from '@/utils/pet-age';
import { formatCheckInTitleDate } from '@/utils/date';

type PetDisplayHelpers = {
  displayPetSpecies: (species: Pet['species']) => string;
  displayPetBreed: (breed: string | null | undefined) => string;
  displayPetSex: (sex: Pet['sex']) => string;
  displayPetSpayNeuterStatus: (status: Pet['spayNeuterStatus']) => string;
  displayPetDate: (date: string | null | undefined) => string;
  displayPetText: (value: string | null | undefined) => string;
  t: (key: string, params?: Record<string, string | number>) => string;
  locale: string;
};

function getLatestWeightRecord(records: PetRecord[]): PetRecord | null {
  const weightRecords = records.filter((record) => record.type === 'weight');
  if (weightRecords.length === 0) {
    return null;
  }

  return weightRecords.sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
}

export function buildReportPetSummary(
  pet: Pet,
  records: PetRecord[],
  helpers: PetDisplayHelpers
): ReportPetSummary {
  const { displayPetSpecies, displayPetBreed, displayPetSex, displayPetSpayNeuterStatus, displayPetDate, displayPetText, t, locale } =
    helpers;

  const latestWeight = getLatestWeightRecord(records);
  const ageFromBirth = pet.birthDate ? formatPetAgeFromBirthDate(pet.birthDate) : null;

  let birthDateLabel = displayPetDate(pet.birthDate);
  if (pet.birthDate && ageFromBirth) {
    birthDateLabel = `${birthDateLabel} (${ageFromBirth})`;
  }

  let weightLabel = displayPetText(null);
  if (latestWeight && latestWeight.type === 'weight') {
    const unitLabel = t(`records.units.${latestWeight.metadata.unit}`);
    weightLabel = t('reports.petCard.weightRecorded', {
      value: `${latestWeight.metadata.value} ${unitLabel}`,
      date: formatCheckInTitleDate(latestWeight.date, locale),
    });
  }

  return {
    name: pet.name,
    photoUri: pet.photoUri ?? null,
    speciesLabel: displayPetSpecies(pet.species),
    breedLabel: displayPetBreed(pet.breed),
    sexLabel: pet.sex ? displayPetSex(pet.sex) : displayPetText(null),
    birthDateLabel,
    spayNeuterLabel: pet.spayNeuterStatus
      ? displayPetSpayNeuterStatus(pet.spayNeuterStatus)
      : displayPetText(null),
    weightLabel,
    ownerName: displayPetText(pet.ownerName),
    microchipId: displayPetText(pet.microchipId),
  };
}
