import { cancelCheckInReminder } from '@/services/notifications';
import * as petStorage from '@/storage/pet.storage';
import {
  removeActivePetId,
  removeAppAppearance,
  removeAppLanguage,
  removeCheckInReminderTime,
  removeCurrentUserId,
  removeNotificationPermission,
  setOnboardingCompleted,
} from '@/storage/prefs.storage';
import { clearLastStoreReviewPromptAt, clearUserProfile } from '@/storage/user.storage';
import { useAppearanceStore } from '@/stores/appearance.store';
import { useCheckInStore } from '@/stores/check-in.store';
import { useLanguageStore } from '@/stores/language.store';
import { useNotificationStore } from '@/stores/notification.store';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { usePetStore } from '@/stores/pet.store';
import { useSetupStore } from '@/stores/setup.store';
import { useUserStore } from '@/stores/user.store';
import { DEFAULT_APP_APPEARANCE } from '@/types/appearance';
import { DEFAULT_APP_LANGUAGE } from '@/types/language';

export async function deleteAllLocalData(): Promise<void> {
  await cancelCheckInReminder();
  await petStorage.deleteAllPets();

  await Promise.all([
    removeActivePetId(),
    setOnboardingCompleted(false),
    removeCurrentUserId(),
    removeCheckInReminderTime(),
    removeAppAppearance(),
    removeAppLanguage(),
    removeNotificationPermission(),
    clearUserProfile(),
    clearLastStoreReviewPromptAt(),
  ]);
}

export function resetAppStoresAfterDataDeletion(): void {
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
  useOnboardingStore.setState({
    hasCompletedOnboarding: false,
    isLoading: false,
    error: null,
  });
  useNotificationStore.setState({
    reminderTime: null,
    permission: null,
    isLoading: false,
    error: null,
  });
  useAppearanceStore.setState({
    appearance: DEFAULT_APP_APPEARANCE,
    isLoading: false,
  });
  useLanguageStore.setState({
    language: DEFAULT_APP_LANGUAGE,
    isLoading: false,
  });
  useSetupStore.getState().resetDraft();
  useUserStore.setState({
    displayName: null,
    avatarUri: null,
    provider: 'guest',
    email: null,
    isPlusActive: false,
    isLoading: false,
    error: null,
  });
}
