import { create } from 'zustand';

import { pullPetsIntoLocal } from '@/services/sync/pets-sync';
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
  removeMember: (membershipId: string) => Promise<void>;
  deactivateSharing: () => Promise<void>;
  previewJoin: (code: string) => Promise<FamilyJoinPreview>;
  joinFamily: (code: string) => Promise<void>;
  leaveFamily: (familyGroupId: string) => Promise<void>;
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
  await pullPetsIntoLocal(userId);
  const { usePetStore } = await import('@/stores/pet.store');
  await usePetStore.getState().loadPets();
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

    await updateFamilyGroupPets(group.id, petIds);
    set({ sharedPetIds: petIds });
  },

  removeMember: async (membershipId) => {
    await removeFamilyMember(membershipId);
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
    await refreshPetsFromCloud(userId);
    await get().loadMemberMemberships();
  },

  leaveFamily: async (familyGroupId) => {
    const userId = getUserId();
    await leaveFamilyGroup(familyGroupId, userId);
    await refreshPetsFromCloud(userId);
    await get().loadMemberMemberships();
  },

  clearError: () => set({ error: null }),
}));
