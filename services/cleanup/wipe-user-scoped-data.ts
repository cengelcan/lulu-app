import { cancelCheckInReminder } from '@/services/notifications';
import * as petRecordStorage from '@/storage/pet-record.storage';
import * as petStorage from '@/storage/pet.storage';
import { removeActivePetId, removeCheckInReminderTime } from '@/storage/prefs.storage';
import { clearUserProfile } from '@/storage/user.storage';
import { useCheckInStore } from '@/stores/check-in.store';
import { useNotificationStore } from '@/stores/notification.store';
import { usePetRecordStore } from '@/stores/pet-record.store';
import { usePetStore } from '@/stores/pet.store';

/**
 * Clears all user-scoped local data (pets, check-ins, records, reminder, profile)
 * while preserving app-level preferences (onboarding, theme, language) and the
 * current auth session. Used when a different account signs in on the same device,
 * since data is stored locally per-device until cloud sync exists.
 */
export async function wipeUserScopedData(): Promise<void> {
  await cancelCheckInReminder();
  await petRecordStorage.deleteAllPetRecords();
  await petStorage.deleteAllPets();

  await Promise.all([
    removeActivePetId(),
    removeCheckInReminderTime(),
    clearUserProfile(),
  ]);

  usePetStore.setState({
    pets: [],
    pet: null,
    activePetId: null,
    isLoading: false,
    error: null,
  });
  useCheckInStore.setState({
    latestCheckIn: null,
    checkIns: [],
    isLoading: false,
    error: null,
  });
  usePetRecordStore.setState({
    records: [],
    isLoading: false,
    error: null,
  });
  useNotificationStore.setState({ reminderTime: null });
}
