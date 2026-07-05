import { useCheckInStore } from '@/stores/check-in.store';
import { useNotificationStore } from '@/stores/notification.store';
import { usePetReminderStore } from '@/stores/pet-reminder.store';
import { usePetRecordStore } from '@/stores/pet-record.store';
import { usePetStore } from '@/stores/pet.store';
import { useSharingStore } from '@/stores/sharing.store';

export function resetUserScopedStores(): void {
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
