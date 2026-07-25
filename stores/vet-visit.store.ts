import { create } from 'zustand';

import { deleteRemoteVetVisit, pushVetVisit } from '@/services/sync/vet-visits-sync';
import * as vetVisitStorage from '@/storage/vet-visit.storage';
import { useUserStore } from '@/stores/user.store';
import type { VetVisitBundle } from '@/types/vet-visit';
import { getStoreErrorKey } from '@/utils/store-error';

type VetVisitState = {
  bundles: VetVisitBundle[];
  isLoading: boolean;
  error: string | null;
  loadVisits: (petId: string) => Promise<void>;
  saveVisit: (bundle: VetVisitBundle) => Promise<void>;
  deleteVisit: (id: string, petId: string) => Promise<void>;
  clear: () => void;
};

export const useVetVisitStore = create<VetVisitState>((set) => ({
  bundles: [], isLoading: false, error: null,
  loadVisits: async (petId) => {
    set({ isLoading: true, error: null });
    try {
      set({ bundles: await vetVisitStorage.getVetVisitBundlesByPetId(petId), isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getStoreErrorKey(error, 'errors.unknown') });
    }
  },
  saveVisit: async (bundle) => {
    set({ error: null });
    try {
      await vetVisitStorage.saveVetVisitBundle(bundle);
      const userId = useUserStore.getState().userId;
      if (userId) {
        try { await pushVetVisit(userId, bundle); }
        catch (error) { console.warn('Failed to sync vet visit to cloud', error); }
      }
      set({ bundles: await vetVisitStorage.getVetVisitBundlesByPetId(bundle.visit.petId) });
    } catch (error) {
      set({ error: getStoreErrorKey(error, 'errors.unknown') });
      throw error;
    }
  },
  deleteVisit: async (id, petId) => {
    set({ error: null });
    try {
      await vetVisitStorage.deleteVetVisit(id);
      if (useUserStore.getState().userId) {
        try { await deleteRemoteVetVisit(id); }
        catch (error) { console.warn('Failed to delete vet visit from cloud', error); }
      }
      set({ bundles: await vetVisitStorage.getVetVisitBundlesByPetId(petId) });
    } catch (error) {
      set({ error: getStoreErrorKey(error, 'errors.unknown') });
      throw error;
    }
  },
  clear: () => set({ bundles: [], isLoading: false, error: null }),
}));
