import { cancelCheckInReminder } from '@/services/notifications';
import * as petStorage from '@/storage/pet.storage';
import {
  removeActivePetId,
  removeCheckInPreferences,
  removeCurrentUserId,
  removeNotificationPermission,
  setOnboardingCompleted,
} from '@/storage/prefs.storage';
import { useCheckInStore } from '@/stores/check-in.store';
import { useNotificationStore } from '@/stores/notification.store';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { usePetStore } from '@/stores/pet.store';
import { useSetupStore } from '@/stores/setup.store';

export async function deleteAllLocalData(): Promise<void> {
  await cancelCheckInReminder();
  await petStorage.deleteAllPets();

  await Promise.all([
    removeActivePetId(),
    setOnboardingCompleted(false),
    removeCurrentUserId(),
    removeCheckInPreferences(),
    removeNotificationPermission(),
  ]);
}

export function resetAppStoresAfterDataDeletion(): void {
  usePetStore.setState({ pet: null, isLoading: false, error: null });
  useCheckInStore.setState({
    latestCheckIn: null,
    checkIns: [],
    isLoading: false,
    error: null,
  });
  useOnboardingStore.setState({
    hasCompletedOnboarding: false,
    isLoading: false,
    error: null,
  });
  useNotificationStore.setState({
    preference: null,
    permission: null,
    isLoading: false,
    error: null,
  });
  useSetupStore.getState().resetDraft();
}
