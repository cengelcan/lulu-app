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
  const { usePetReminderStore } =
    require('@/stores/pet-reminder.store') as typeof import('@/stores/pet-reminder.store');
  const { useNotificationStore } =
    require('@/stores/notification.store') as typeof import('@/stores/notification.store');
  const { useSharingStore } =
    require('@/stores/sharing.store') as typeof import('@/stores/sharing.store');

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
  useNotificationStore.setState({ reminderTime: null });
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
}
