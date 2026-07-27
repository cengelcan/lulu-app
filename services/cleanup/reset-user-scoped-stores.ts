/* eslint-disable @typescript-eslint/no-require-imports -- lazy require breaks circular deps at bundle load */

/**
 * Store imports are deferred to call time so this module does not participate
 * in the user.store ↔ pet/check-in/... require cycle at bundle load.
 */
export function resetUserScopedStores(): void {
  const { usePetStore } = require('@/stores/pet.store') as typeof import('@/stores/pet.store');
  const { useCheckInStore } =
    require('@/stores/check-in.store') as typeof import('@/stores/check-in.store');
  const { usePetRecordStore } =
    require('@/stores/pet-record.store') as typeof import('@/stores/pet-record.store');
  const { useMedicationStore } =
    require('@/stores/medication.store') as typeof import('@/stores/medication.store');
  const { usePetReminderStore } =
    require('@/stores/pet-reminder.store') as typeof import('@/stores/pet-reminder.store');
  const { useNotificationStore } =
    require('@/stores/notification.store') as typeof import('@/stores/notification.store');
  const { useSharingStore } =
    require('@/stores/sharing.store') as typeof import('@/stores/sharing.store');
  const { useFamilyActivityStore } =
    require('@/stores/family-activity.store') as typeof import('@/stores/family-activity.store');
  const { useVetVisitStore } =
    require('@/stores/vet-visit.store') as typeof import('@/stores/vet-visit.store');
  const { useExperiencePreferencesStore } =
    require('@/stores/experience-preferences.store') as typeof import('@/stores/experience-preferences.store');

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
  useMedicationStore.setState({
    bundles: [],
    doses: [],
    isLoading: false,
    error: null,
  });
  useVetVisitStore.setState({ bundles: [], isLoading: false, error: null });
  useNotificationStore.setState({
    reminderTime: null,
    permission: null,
    dailyCheckInNotificationsEnabled: false,
    petReminderNotificationsEnabled: true,
    medicationDoseNotificationsEnabled: true,
    medicationRefillNotificationsEnabled: true,
    familyActivityDigestEnabled: false,
    isLoading: false,
    error: null,
  });
  useSharingStore.setState({
    familyGroup: null,
    memberFamilyGroup: null,
    familyOwnerDisplayName: null,
    sharedPetIds: [],
    members: [],
    memberships: [],
    familyTabLoaded: false,
    isLoading: false,
    error: null,
  });
  useFamilyActivityStore.getState().clear();
  useExperiencePreferencesStore.setState({
    preferences: null,
    hasLoaded: false,
    isLoading: false,
    error: null,
  });
}
