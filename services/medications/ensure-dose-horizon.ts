import { addDays } from '@/services/notifications/date';
import { deleteRemoteMedicationDoses, pushMedicationDoses } from '@/services/sync/medication-sync';
import * as medicationStorage from '@/storage/medication.storage';
import { formatLocalDate } from '@/utils/date';
import { generateMedicationDoses } from '@/utils/medication-schedule';

export const MEDICATION_DOSE_HORIZON_DAYS = 14;

export async function ensureMedicationDoseHorizon(
  petId: string,
  referenceDate: Date = new Date()
): Promise<void> {
  const rangeStart = formatLocalDate(referenceDate);
  const rangeEnd = formatLocalDate(addDays(referenceDate, MEDICATION_DOSE_HORIZON_DAYS));
  const plans = await medicationStorage.getMedicationPlansByPetId(petId);
  const existing = await medicationStorage.getMedicationDosesByPetId(petId, rangeStart, rangeEnd);
  const existingIds = new Set(existing.map((dose) => dose.id));
  const generated = [];

  for (const plan of plans) {
    const schedules = await medicationStorage.getMedicationSchedulesByPlanId(plan.id);
    generated.push(...generateMedicationDoses({ plan, schedules, rangeStart, rangeEnd }));
  }

  const missing = generated.filter((dose) => !existingIds.has(dose.id));
  const generatedIds = new Set(generated.map((dose) => dose.id));
  const stale = existing.filter((dose) => dose.status === 'scheduled' && !generatedIds.has(dose.id));
  for (const dose of stale) {
    await medicationStorage.deleteMedicationDose(dose.id);
  }
  if (stale.length > 0) {
    try { await deleteRemoteMedicationDoses(stale.map((dose) => dose.id)); }
    catch (error) { console.warn('Failed to remove stale medication doses', error); }
  }
  await medicationStorage.insertMedicationDosesIfMissing(missing);
  if (missing.length > 0) {
    try {
      await pushMedicationDoses(missing, { preserveExisting: true });
    } catch (error) {
      console.warn('Failed to sync generated medication doses', error);
    }
  }
}
