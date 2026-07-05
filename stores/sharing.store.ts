import { create } from 'zustand';

import { pushPet } from '@/services/sync/pets-sync';
import {
  refreshDataAfterMembershipChange,
  refreshSharedPetDataFromCloud,
} from '@/services/sync/member-cloud-sync';
import {
  acceptFamilyJoin,
  createFamilyGroup,
  deactivateFamilyGroup,
  fetchFamilyGroupById,
  fetchFamilyGroupPetIds,
  fetchFamilyMembers,
  fetchMembershipsForUser,
  fetchOwnerFamilyGroup,
  fetchProfileDisplayName,
  leaveFamilyGroup,
  previewFamilyJoin,
  removeFamilyMember,
  rotateFamilyCode,
  updateFamilyGroupPets,
  updateFamilyGroupProfile,
} from '@/services/sharing/family-sharing';
import { useUserStore } from '@/stores/user.store';
import type { FamilyGroup, FamilyJoinPreview, FamilyMemberSummary } from '@/types/sharing';

type SharingState = {
  familyGroup: FamilyGroup | null;
  memberFamilyGroup: FamilyGroup | null;
  familyOwnerDisplayName: string | null;
  sharedPetIds: string[];
  members: FamilyMemberSummary[];
  memberships: Awaited<ReturnType<typeof fetchMembershipsForUser>>;
  familyTabLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  loadOwnerFamilySharing: () => Promise<void>;
  loadMemberMemberships: () => Promise<void>;
  loadMemberFamilyGroup: () => Promise<void>;
  loadFamilyTab: (options?: { silent?: boolean }) => Promise<void>;
  ensureFamilyGroup: (input?: { name?: string; iconKey?: string }) => Promise<FamilyGroup>;
  updateFamilyProfile: (input: { name?: string; iconKey?: string }) => Promise<void>;
  rotateCode: () => Promise<void>;
  setSharedPets: (petIds: string[]) => Promise<void>;
  removeMember: (familyGroupId: string, memberUserId: string) => Promise<void>;
  deactivateSharing: () => Promise<void>;
  previewJoin: (code: string) => Promise<FamilyJoinPreview>;
  joinFamily: (code: string) => Promise<void>;
  leaveFamily: (familyGroupId: string) => Promise<void>;
  autoShareNewPetIfActive: (petId: string) => Promise<void>;
  refreshSharedDataFromCloud: () => Promise<void>;
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
  memberFamilyGroup: null,
  familyOwnerDisplayName: null,
  sharedPetIds: [],
  members: [],
  memberships: [],
  familyTabLoaded: false,
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

  loadMemberFamilyGroup: async () => {
    const userId = getUserId();
    const memberships = get().memberships.length
      ? get().memberships
      : await fetchMembershipsForUser(userId);

    if (memberships.length === 0) {
      set({ memberFamilyGroup: null });
      return;
    }

    const familyGroupId = memberships[0].familyGroupId;
    const memberFamilyGroup = await fetchFamilyGroupById(familyGroupId);
    const members = memberFamilyGroup ? await fetchFamilyMembers(familyGroupId) : [];

    set({
      memberships,
      memberFamilyGroup,
      members,
      sharedPetIds: memberFamilyGroup
        ? await fetchFamilyGroupPetIds(memberFamilyGroup.id)
        : [],
    });
  },

  loadFamilyTab: async (options) => {
    const silent = options?.silent ?? get().familyTabLoaded;

    if (!silent) {
      set({ isLoading: true, error: null });
    } else {
      set({ error: null });
    }

    try {
      const userId = getUserId();
      const [familyGroup, memberships] = await Promise.all([
        fetchOwnerFamilyGroup(userId),
        fetchMembershipsForUser(userId),
      ]);

      if (familyGroup) {
        const [sharedPetIds, members] = await Promise.all([
          fetchFamilyGroupPetIds(familyGroup.id),
          fetchFamilyMembers(familyGroup.id),
        ]);

        set({
          familyGroup,
          memberFamilyGroup: null,
          familyOwnerDisplayName: null,
          sharedPetIds,
          members,
          memberships,
          isLoading: false,
          familyTabLoaded: true,
        });
        return;
      }

      if (memberships.length > 0) {
        const familyGroupId = memberships[0].familyGroupId;
        const memberFamilyGroup = await fetchFamilyGroupById(familyGroupId);
        const [sharedPetIds, members, familyOwnerDisplayName] = memberFamilyGroup
          ? await Promise.all([
              fetchFamilyGroupPetIds(memberFamilyGroup.id),
              fetchFamilyMembers(familyGroupId),
              fetchProfileDisplayName(memberFamilyGroup.ownerUserId),
            ])
          : [[], [], null];

        set({
          familyGroup: null,
          memberFamilyGroup,
          familyOwnerDisplayName,
          sharedPetIds,
          members,
          memberships,
          isLoading: false,
          familyTabLoaded: true,
        });
        return;
      }

      set({
        familyGroup: null,
        memberFamilyGroup: null,
        familyOwnerDisplayName: null,
        sharedPetIds: [],
        members: [],
        memberships,
        isLoading: false,
        familyTabLoaded: true,
      });
    } catch (error) {
      set({
        isLoading: false,
        familyTabLoaded: get().familyTabLoaded,
        error: error instanceof Error ? error.message : 'errors.loadFamilySharing',
      });
    }
  },

  ensureFamilyGroup: async (input) => {
    const userId = getUserId();
    const familyGroup = await createFamilyGroup(userId, input);
    const sharedPetIds = await fetchFamilyGroupPetIds(familyGroup.id);

    set({ familyGroup, memberFamilyGroup: null, sharedPetIds });
    return familyGroup;
  },

  updateFamilyProfile: async (input) => {
    const group = get().familyGroup;

    if (!group) {
      throw new Error('errors.familyGroupNotFound');
    }

    const familyGroup = await updateFamilyGroupProfile(group.id, input);
    set({ familyGroup });
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
      memberFamilyGroup: null,
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
    await get().loadFamilyTab();
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

  refreshSharedDataFromCloud: async () => {
    const userId = getUserId();
    await refreshSharedPetDataFromCloud(userId);
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
