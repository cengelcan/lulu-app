import {
  MEDICATION_DOSE_ACTION_SNOOZE,
  MEDICATION_DOSE_ACTION_TAKE,
} from '@/services/notifications/constants';
import { useMedicationStore } from '@/stores/medication.store';

type MedicationNotificationResponse = {
  actionIdentifier?: string;
  notification: { request: { content: { data: unknown } } };
};

export async function handleMedicationDoseNotificationAction(
  response: MedicationNotificationResponse | null | undefined
): Promise<boolean> {
  if (!response) return false;
  const data = response.notification.request.content.data as {
    type?: unknown;
    doseId?: unknown;
  } | null;
  if (data?.type !== 'medication_dose' || typeof data.doseId !== 'string') return false;

  if (response.actionIdentifier === MEDICATION_DOSE_ACTION_TAKE) {
    await useMedicationStore.getState().takeDose(data.doseId);
    return true;
  }
  if (response.actionIdentifier === MEDICATION_DOSE_ACTION_SNOOZE) {
    await useMedicationStore.getState().snoozeDose(data.doseId, 30);
    return true;
  }
  return false;
}
