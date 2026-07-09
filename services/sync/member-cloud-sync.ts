import {
  fetchFamilyGroupPetIds,
  fetchMemberPetIds,
  fetchOwnerFamilyGroup,
} from '@/services/sharing/family-sharing';
import { syncPetReminderNotificationSchedule } from '@/services/notifications/pet-reminder-schedule';
import { pullCheckInsIntoLocal } from '@/services/sync/check-ins-sync';
import { pullPetsIntoLocal } from '@/services/sync/pets-sync';
import { pullPetRemindersIntoLocal } from '@/services/sync/reminders-sync';
import { pullPetRecordsIntoLocal } from '@/services/sync/records-sync';
import { withCloudDataSyncLock } from '@/services/sync/sync-lock';

async function refreshPetCareStores(petId: string): Promise<void> {
  const [{ useCheckInStore }, { usePetRecordStore }, { usePetReminderStore }] = await Promise.all([
    import('@/stores/check-in.store'),
    import('@/stores/pet-record.store'),
    import('@/stores/pet-reminder.store'),
  ]);

  await Promise.all([
    useCheckInStore.getState().loadCheckIns(petId),
    usePetRecordStore.getState().loadRecords(petId),
    usePetReminderStore.getState().loadReminders(petId),
  ]);
}

async function reconcileActivePetAfterPull(previousActivePetId: string | null): Promise<void> {
  const { usePetStore } = await import('@/stores/pet.store');
  const pets = usePetStore.getState().pets;
  const stillHasActive =
    previousActivePetId !== null && pets.some((pet) => pet.id === previousActivePetId);

  if (!stillHasActive && pets.length > 0) {
    const nextActive = pets.find((pet) => pet.status !== 'deceased') ?? pets[0];
    await usePetStore.getState().setActivePet(nextActive.id);
  }

  const activePetId = usePetStore.getState().activePetId;

  if (activePetId) {
    await refreshPetCareStores(activePetId);
  }
}

async function pullAccessibleDataIntoLocal(userId: string): Promise<void> {
  return withCloudDataSyncLock(async () => {
  const { usePetStore } = await import('@/stores/pet.store');
  const previousActivePetId = usePetStore.getState().activePetId;

  await pullPetsIntoLocal(userId);
  await pullCheckInsIntoLocal(userId);
  await pullPetRecordsIntoLocal(userId);
  await pullPetRemindersIntoLocal(userId);
  await usePetStore.getState().loadPets();
  await reconcileActivePetAfterPull(previousActivePetId);

  try {
    await syncPetReminderNotificationSchedule();
  } catch (error) {
    console.warn('Failed to sync pet reminder notifications after cloud pull', error);
  }
  });
}

async function hasSharedPetContext(userId: string): Promise<boolean> {
  const memberPetIds = await fetchMemberPetIds(userId);

  if (memberPetIds.length > 0) {
    return true;
  }

  const familyGroup = await fetchOwnerFamilyGroup(userId);

  if (!familyGroup?.isActive) {
    return false;
  }

  const sharedPetIds = await fetchFamilyGroupPetIds(familyGroup.id);
  return sharedPetIds.length > 0;
}

/**
 * Pulls shared pet data when the user is part of family sharing — as a member
 * with shared pets, or as an owner with pets shared in an active family group.
 */
export async function refreshSharedPetDataFromCloud(userId: string): Promise<void> {
  const shouldRefresh = await hasSharedPetContext(userId);

  if (!shouldRefresh) {
    return;
  }

  await pullAccessibleDataIntoLocal(userId);
}

/**
 * Pulls cloud data after membership changes (join or leave) regardless of the
 * current membership count.
 */
export async function refreshDataAfterMembershipChange(userId: string): Promise<void> {
  await pullAccessibleDataIntoLocal(userId);
}
