import { ensureMedicationDoseHorizon } from '@/services/medications/ensure-dose-horizon';
import {
  ANDROID_MEDICATION_DOSE_CHANNEL_ID,
  getMedicationDoseNotificationId,
  isMedicationDoseNotificationId,
  MEDICATION_DOSE_NOTIFICATION_SOUND,
  MEDICATION_DOSE_ACTION_SNOOZE,
  MEDICATION_DOSE_ACTION_TAKE,
  MEDICATION_DOSE_CATEGORY_ID,
} from '@/services/notifications/constants';
import { getMedicationDoseNotificationContent } from '@/services/notifications/content';
import { getExpoNotificationsModule } from '@/services/notifications/expo-notifications-module';
import { ensureNotificationHandlerConfigured } from '@/services/notifications/handler';
import { hasNotificationPermission } from '@/services/notifications/permissions';
import * as medicationStorage from '@/storage/medication.storage';
import { getActivePet } from '@/storage/pet.storage';
import { getAppLanguage, getPetReminderNotificationsEnabled } from '@/storage/prefs.storage';
import { translate } from '@/i18n';

export async function cancelAllMedicationDoseNotifications(): Promise<void> {
  if (process.env.EXPO_OS === 'web') return;
  const Notifications = await getExpoNotificationsModule();
  if (!Notifications) return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.filter(({ identifier }: { identifier: string }) =>
    isMedicationDoseNotificationId(identifier)
  ).map(({ identifier }: { identifier: string }) =>
    Notifications.cancelScheduledNotificationAsync(identifier)
  ));
}

export async function syncMedicationDoseNotificationSchedule(): Promise<void> {
  if (process.env.EXPO_OS === 'web') return;
  await ensureNotificationHandlerConfigured();
  await cancelAllMedicationDoseNotifications();
  const [enabled, pet, language, permission] = await Promise.all([
    getPetReminderNotificationsEnabled(), getActivePet(), getAppLanguage(), hasNotificationPermission(),
  ]);
  if (!enabled || !permission || !pet || pet.status === 'deceased') return;

  await ensureMedicationDoseHorizon(pet.id);
  const now = new Date();
  const doses = await medicationStorage.getUpcomingMedicationDosesByPetId(pet.id, now.toISOString());
  const plans = await medicationStorage.getMedicationPlansByPetId(pet.id);
  const planById = new Map(plans.map((plan) => [plan.id, plan]));
  const Notifications = await getExpoNotificationsModule();
  if (!Notifications) return;

  await Notifications.setNotificationCategoryAsync(MEDICATION_DOSE_CATEGORY_ID, [
    {
      identifier: MEDICATION_DOSE_ACTION_TAKE,
      buttonTitle: translate(language, 'medications.actions.take'),
      options: { opensAppToForeground: true },
    },
    {
      identifier: MEDICATION_DOSE_ACTION_SNOOZE,
      buttonTitle: translate(language, 'medications.actions.snooze'),
      options: { opensAppToForeground: true },
    },
  ]);

  await Promise.all(doses.map(async (dose) => {
    const plan = planById.get(dose.planId);
    if (!plan || plan.status !== 'active') return;
    const triggerAt = new Date(dose.snoozedUntil ?? dose.scheduledAt);
    if (triggerAt <= now) return;
    const { title, body } = getMedicationDoseNotificationContent(plan, pet.name, language);
    await Notifications.scheduleNotificationAsync({
      identifier: getMedicationDoseNotificationId(dose.id),
      content: {
        title, body, sound: MEDICATION_DOSE_NOTIFICATION_SOUND,
        categoryIdentifier: MEDICATION_DOSE_CATEGORY_ID,
        data: { route: `/medications?doseId=${encodeURIComponent(dose.id)}`, doseId: dose.id, type: 'medication_dose' },
        ...(process.env.EXPO_OS === 'android' ? { channelId: ANDROID_MEDICATION_DOSE_CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerAt,
        ...(process.env.EXPO_OS === 'android' ? { channelId: ANDROID_MEDICATION_DOSE_CHANNEL_ID } : {}),
      },
    });
  }));
}
