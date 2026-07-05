import { fetchMemberPetIds } from '@/services/sharing/family-sharing';
import { pullCheckInsIntoLocal } from '@/services/sync/check-ins-sync';
import { pullPetsIntoLocal } from '@/services/sync/pets-sync';
import { pullPetRemindersIntoLocal } from '@/services/sync/reminders-sync';
import { pullPetRecordsIntoLocal } from '@/services/sync/records-sync';

async function reconcileActivePetAfterPull(previousActivePetId: string | null): Promise<void> {
  const { usePetStore } = await import('@/stores/pet.store');
  const pets = usePetStore.getState().pets;
  const stillHasActive =
    previousActivePetId !== null && pets.some((pet) => pet.id === previousActivePetId);

  if (!stillHasActive && pets.length > 0) {
    const nextActive = pets.find((pet) => pet.status !== 'deceased') ?? pets[0];
    await usePetStore.getState().setActivePet(nextActive.id);
    return;
  }

  if (previousActivePetId && stillHasActive) {
    const { useCheckInStore } = await import('@/stores/check-in.store');
    await useCheckInStore.getState().loadCheckIns(previousActivePetId);
  }
}

async function pullAccessibleDataIntoLocal(userId: string): Promise<void> {
  const { usePetStore } = await import('@/stores/pet.store');
  const previousActivePetId = usePetStore.getState().activePetId;

  await pullPetsIntoLocal(userId);
  await pullCheckInsIntoLocal(userId);
  await pullPetRecordsIntoLocal(userId);
  await pullPetRemindersIntoLocal(userId);
  await usePetStore.getState().loadPets();
  await reconcileActivePetAfterPull(previousActivePetId);
}

/**
 * Reconciles a family member's local cache with cloud data after the owner
 * changes shared pets or revokes access.
 */
export async function refreshMemberDataFromCloud(userId: string): Promise<void> {
  const memberPetIds = await fetchMemberPetIds(userId);

  if (memberPetIds.length === 0) {
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
