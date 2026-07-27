import { getMedicationRefillNotificationId, ANDROID_MEDICATION_DOSE_CHANNEL_ID } from '@/services/notifications/constants';
import { getMedicationRefillNotificationContent } from '@/services/notifications/content';
import { getExpoNotificationsModule } from '@/services/notifications/expo-notifications-module';
import { hasNotificationPermission } from '@/services/notifications/permissions';
import { shouldSendMedicationRefillNotification } from '@/services/notifications/medication-refill-policy';
import { loadNotificationCategoryPreferences } from '@/storage/experience-preferences.storage';
import * as medicationStorage from '@/storage/medication.storage';
import { getPetById } from '@/storage/pet.storage';
import { getAppLanguage } from '@/storage/prefs.storage';

export async function notifyMedicationRefillIfNeeded(
  planId: string,
  petId: string
): Promise<void> {
  if (process.env.EXPO_OS === 'web') return;

  const [categories, inventory, pet, language, permission] = await Promise.all([
    loadNotificationCategoryPreferences(),
    medicationStorage.getMedicationInventoryByPlanId(planId),
    getPetById(petId),
    getAppLanguage(),
    hasNotificationPermission(),
  ]);

  if (
    !categories.medicationRefill ||
    !permission ||
    !inventory ||
    !pet ||
    pet.status === 'deceased' ||
    !shouldSendMedicationRefillNotification(
      inventory.remainingDoses,
      inventory.refillThreshold
    )
  ) {
    return;
  }

  const Notifications = await getExpoNotificationsModule();
  if (!Notifications) return;

  const content = getMedicationRefillNotificationContent(pet.name, language);
  await Notifications.scheduleNotificationAsync({
    identifier: getMedicationRefillNotificationId(planId),
    content: {
      ...content,
      data: { route: '/medications', type: 'medication_refill' },
      ...(process.env.EXPO_OS === 'android'
        ? { channelId: ANDROID_MEDICATION_DOSE_CHANNEL_ID }
        : {}),
    },
    trigger: null,
  });
}
