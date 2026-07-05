import { cancelCheckInReminder, cancelAllPetReminderNotifications } from '@/services/notifications';
import * as checkInStorage from '@/storage/check-in.storage';
import * as petReminderStorage from '@/storage/pet-reminder.storage';
import * as petRecordStorage from '@/storage/pet-record.storage';
import * as petStorage from '@/storage/pet.storage';
import { clearDismissedInboxItems } from '@/storage/inbox-dismissed.storage';
import {
  clearJoinRemindersPromptState,
} from '@/storage/join-reminders-prompt.storage';
import { clearPendingFamilyJoinCode } from '@/storage/pending-family-join.storage';
import { clearUserSetupPath } from '@/storage/setup-path.storage';
import {
  removeActivePetId,
  removeAppAppearance,
  removeAppLanguage,
  removeCheckInReminderTime,
  removeCurrentUserId,
  removeNotificationPermission,
  removePetReminderNotificationsEnabled,
  setOnboardingCompleted,
} from '@/storage/prefs.storage';
import { clearLastStoreReviewPromptAt, clearUserProfile } from '@/storage/user.storage';
import { useCheckInStore } from '@/stores/check-in.store';
import { useLanguageStore } from '@/stores/language.store';
import { useNotificationStore } from '@/stores/notification.store';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { usePetReminderStore } from '@/stores/pet-reminder.store';
import { usePetRecordStore } from '@/stores/pet-record.store';
import { usePetStore } from '@/stores/pet.store';
import { useSetupStore } from '@/stores/setup.store';
import { useUserStore } from '@/stores/user.store';
import { DEFAULT_APP_LANGUAGE_PREFERENCE } from '@/types/language';
import { resolveLanguagePreference } from '@/utils/resolve-language-preference';

export async function deleteAllLocalData(): Promise<void> {
  await cancelCheckInReminder();
  await cancelAllPetReminderNotifications();
  await petReminderStorage.deleteAllPetReminders();
  await petRecordStorage.deleteAllPetRecords();
  await checkInStorage.deleteAllCheckIns();
  await petStorage.deleteAllPets();

  await Promise.all([
    removeActivePetId(),
    setOnboardingCompleted(false),
    removeCurrentUserId(),
    removeCheckInReminderTime(),
    removePetReminderNotificationsEnabled(),
    removeAppAppearance(),
    removeAppLanguage(),
    removeNotificationPermission(),
    clearUserProfile(),
    clearLastStoreReviewPromptAt(),
    clearDismissedInboxItems(),
    clearPendingFamilyJoinCode(),
    clearUserSetupPath(),
    clearJoinRemindersPromptState(),
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
  usePetRecordStore.setState({
    records: [],
    isLoading: false,
    error: null,
  });
  usePetReminderStore.setState({
    reminders: [],
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
    petReminderNotificationsEnabled: true,
    isLoading: false,
    error: null,
  });
  useLanguageStore.setState({
    languagePreference: DEFAULT_APP_LANGUAGE_PREFERENCE,
    resolvedLanguage: resolveLanguagePreference(DEFAULT_APP_LANGUAGE_PREFERENCE),
    isLoading: false,
  });
  useSetupStore.getState().resetDraft();
  useUserStore.setState({
    userId: null,
    authStatus: 'unauthenticated',
    displayName: null,
    avatarUri: null,
    provider: 'guest',
    email: null,
    isPlusActive: false,
    plusExpiresAt: null,
    isLoading: false,
    error: null,
  });
}
