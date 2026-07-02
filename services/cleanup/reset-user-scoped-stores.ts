import { useCheckInStore } from '@/stores/check-in.store';
import { useNotificationStore } from '@/stores/notification.store';
import { usePetReminderStore } from '@/stores/pet-reminder.store';
import { usePetRecordStore } from '@/stores/pet-record.store';
import { usePetStore } from '@/stores/pet.store';

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
}
