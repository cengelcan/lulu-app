import { cancelCheckInReminder, cancelAllMedicationDoseNotifications, cancelAllPetReminderNotifications } from '@/services/notifications';
import * as checkInStorage from '@/storage/check-in.storage';
import * as activityEventStorage from '@/storage/activity-event.storage';
import * as medicationStorage from '@/storage/medication.storage';
import { clearPendingFamilyJoinCode } from '@/storage/pending-family-join.storage';
import * as petReminderStorage from '@/storage/pet-reminder.storage';
import * as petRecordStorage from '@/storage/pet-record.storage';
import * as petStorage from '@/storage/pet.storage';
import * as vetVisitStorage from '@/storage/vet-visit.storage';
import {
  removeActivePetId,
  removeCheckInReminderTime,
  removeFamilyActivityDigestEnabled,
} from '@/storage/prefs.storage';
import { clearUserSetupPath } from '@/storage/setup-path.storage';
import { clearUserProfile } from '@/storage/user.storage';
import {
  resetUserScopedNotificationPreferences,
  resetWeightUnitPreference,
} from '@/storage/experience-preferences.storage';
import { getDeviceRegionalSnapshot } from '@/utils/device-regional-settings';

/**
 * Clears all user-scoped local data (pets, check-ins, records, reminder, profile)
 * while preserving app-level preferences (onboarding, theme, language) and the
 * current auth session. The user-scoped weight unit is reset to the device default
 * until the next account's cloud preference is reconciled.
 */
export async function wipeUserScopedData(): Promise<void> {
  await cancelCheckInReminder();
  await cancelAllPetReminderNotifications();
  await cancelAllMedicationDoseNotifications();
  await activityEventStorage.deleteAllActivityEvents();
  await medicationStorage.deleteAllMedicationData();
  await petReminderStorage.deleteAllPetReminders();
  await petRecordStorage.deleteAllPetRecords();
  await vetVisitStorage.deleteAllVetVisits();
  await checkInStorage.deleteAllCheckIns();
  await petStorage.deleteAllPets();
  const measurementSystem = getDeviceRegionalSnapshot().measurementSystem;
  resetWeightUnitPreference(measurementSystem);
  resetUserScopedNotificationPreferences(measurementSystem);

  await Promise.all([
    removeActivePetId(),
    removeCheckInReminderTime(),
    removeFamilyActivityDigestEnabled(),
    clearUserProfile(),
    clearUserSetupPath(),
    clearPendingFamilyJoinCode(),
  ]);
}
