import { cancelCheckInReminder } from '@/services/notifications';
import * as petStorage from '@/storage/pet.storage';
import {
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

export async function deleteAllLocalData(petId?: string | null): Promise<void> {
  await cancelCheckInReminder();

  const resolvedPetId = petId ?? (await petStorage.getPet())?.id ?? null;

  if (resolvedPetId) {
    await petStorage.deletePet(resolvedPetId);
  }

  await Promise.all([
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
