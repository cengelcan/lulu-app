import { create } from 'zustand';

import { pushPet } from '@/services/sync/pets-sync';
import { refreshDataAfterMembershipChange, refreshMemberDataFromCloud } from '@/services/sync/member-cloud-sync';
import {
  acceptFamilyJoin,
  createFamilyGroup,
  deactivateFamilyGroup,
  fetchFamilyGroupPetIds,
  fetchFamilyMembers,
  fetchMembershipsForUser,
  fetchOwnerFamilyGroup,
  leaveFamilyGroup,
  previewFamilyJoin,
  removeFamilyMember,
  rotateFamilyCode,
  updateFamilyGroupPets,
} from '@/services/sharing/family-sharing';
import { useUserStore } from '@/stores/user.store';
import type { FamilyGroup, FamilyJoinPreview, FamilyMemberSummary } from '@/types/sharing';

type SharingState = {
  familyGroup: FamilyGroup | null;
  sharedPetIds: string[];
  members: FamilyMemberSummary[];
  memberships: Awaited<ReturnType<typeof fetchMembershipsForUser>>;
  isLoading: boolean;
  error: string | null;
  loadOwnerFamilySharing: () => Promise<void>;
  loadMemberMemberships: () => Promise<void>;
  ensureFamilyGroup: () => Promise<FamilyGroup>;
  rotateCode: () => Promise<void>;
  setSharedPets: (petIds: string[]) => Promise<void>;
  removeMember: (familyGroupId: string, memberUserId: string) => Promise<void>;
  deactivateSharing: () => Promise<void>;
  previewJoin: (code: string) => Promise<FamilyJoinPreview>;
  joinFamily: (code: string) => Promise<void>;
  leaveFamily: (familyGroupId: string) => Promise<void>;
  autoShareNewPetIfActive: (petId: string) => Promise<void>;
  refreshMemberPetsFromCloud: () => Promise<void>;
  handleSharingRealtimeUpdate: () => Promise<void>;
  clearError: () => void;
};

function getUserId(): string {
  const userId = useUserStore.getState().userId;

  if (!userId) {
    throw new Error('errors.notAuthenticated');
  }

  return userId;
}

async function refreshPetsFromCloud(userId: string): Promise<void> {
  await refreshDataAfterMembershipChange(userId);
}

export const useSharingStore = create<SharingState>((set, get) => ({
  familyGroup: null,
  sharedPetIds: [],
  members: [],
  memberships: [],
  isLoading: false,
  error: null,

  loadOwnerFamilySharing: async () => {
    set({ isLoading: true, error: null });

    try {
      const userId = getUserId();
      const familyGroup = await fetchOwnerFamilyGroup(userId);
      const sharedPetIds = familyGroup ? await fetchFamilyGroupPetIds(familyGroup.id) : [];
      const members = familyGroup ? await fetchFamilyMembers(familyGroup.id) : [];

      set({
        familyGroup,
        sharedPetIds,
        members,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'errors.loadFamilySharing',
      });
    }
  },

  loadMemberMemberships: async () => {
    set({ isLoading: true, error: null });

    try {
      const userId = getUserId();
      const memberships = await fetchMembershipsForUser(userId);

      set({
        memberships,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'errors.loadFamilySharing',
      });
    }
  },

  ensureFamilyGroup: async () => {
    const userId = getUserId();
    const familyGroup = await createFamilyGroup(userId);
    const sharedPetIds = await fetchFamilyGroupPetIds(familyGroup.id);

    set({ familyGroup, sharedPetIds });
    return familyGroup;
  },

  rotateCode: async () => {
    const group = get().familyGroup;

    if (!group) {
      throw new Error('errors.familyGroupNotFound');
    }

    const familyGroup = await rotateFamilyCode(group.id);
    set({ familyGroup });
  },

  setSharedPets: async (petIds) => {
    const group = get().familyGroup;

    if (!group) {
      throw new Error('errors.familyGroupNotFound');
    }

    const userId = getUserId();
    const { usePetStore } = await import('@/stores/pet.store');
    const ownedPets = usePetStore
      .getState()
      .pets.filter((pet) => (pet.sharingRole ?? 'owner') === 'owner');

    for (const petId of petIds) {
      const pet = ownedPets.find((entry) => entry.id === petId);

      if (pet) {
        await pushPet(userId, pet);
      }
    }

    await updateFamilyGroupPets(group.id, petIds);
    set({ sharedPetIds: petIds });
    await get().loadOwnerFamilySharing();
  },

  removeMember: async (familyGroupId, memberUserId) => {
    await removeFamilyMember(familyGroupId, memberUserId);
    await get().loadOwnerFamilySharing();
  },

  deactivateSharing: async () => {
    const group = get().familyGroup;

    if (!group) {
      return;
    }

    await deactivateFamilyGroup(group.id);
    set({
      familyGroup: null,
      sharedPetIds: [],
      members: [],
    });
  },

  previewJoin: async (code) => previewFamilyJoin(code),

  joinFamily: async (code) => {
    const userId = getUserId();
    await acceptFamilyJoin(code);
    await refreshDataAfterMembershipChange(userId);
    await get().loadMemberMemberships();
  },

  leaveFamily: async (familyGroupId) => {
    const userId = getUserId();
    await leaveFamilyGroup(familyGroupId, userId);
    await refreshPetsFromCloud(userId);
    await get().loadMemberMemberships();
  },

  autoShareNewPetIfActive: async (petId) => {
    const userId = getUserId();
    const familyGroup = get().familyGroup ?? (await fetchOwnerFamilyGroup(userId));

    if (!familyGroup?.isActive) {
      return;
    }

    if (!get().familyGroup) {
      set({ familyGroup });
    }

    const sharedPetIds =
      get().sharedPetIds.length > 0
        ? get().sharedPetIds
        : await fetchFamilyGroupPetIds(familyGroup.id);

    if (sharedPetIds.length === 0 || sharedPetIds.includes(petId)) {
      return;
    }

    await get().setSharedPets([...sharedPetIds, petId]);
  },

  refreshMemberPetsFromCloud: async () => {
    const userId = getUserId();
    await refreshMemberDataFromCloud(userId);
  },

  handleSharingRealtimeUpdate: async () => {
    const userId = getUserId();

    await refreshDataAfterMembershipChange(userId);

    const familyGroup = get().familyGroup ?? (await fetchOwnerFamilyGroup(userId));

    if (familyGroup?.isActive) {
      await get().loadOwnerFamilySharing();
    }

    await get().loadMemberMemberships();
  },

  clearError: () => set({ error: null }),
}));
