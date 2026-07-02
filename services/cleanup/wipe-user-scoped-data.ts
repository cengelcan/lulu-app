import { cancelCheckInReminder, cancelAllPetReminderNotifications } from '@/services/notifications';
import * as checkInStorage from '@/storage/check-in.storage';
import * as petReminderStorage from '@/storage/pet-reminder.storage';
import * as petRecordStorage from '@/storage/pet-record.storage';
import * as petStorage from '@/storage/pet.storage';
import { removeActivePetId, removeCheckInReminderTime } from '@/storage/prefs.storage';
import { clearUserProfile } from '@/storage/user.storage';

/**
 * Clears all user-scoped local data (pets, check-ins, records, reminder, profile)
 * while preserving app-level preferences (onboarding, theme, language) and the
 * current auth session. Used when a different account signs in on the same device,
 * since data is stored locally per-device until cloud sync exists.
 */
export async function wipeUserScopedData(): Promise<void> {
  await cancelCheckInReminder();
  await cancelAllPetReminderNotifications();
  await petReminderStorage.deleteAllPetReminders();
  await petRecordStorage.deleteAllPetRecords();
  await checkInStorage.deleteAllCheckIns();
  await petStorage.deleteAllPets();

  await Promise.all([
    removeActivePetId(),
    removeCheckInReminderTime(),
    clearUserProfile(),
  ]);
}
