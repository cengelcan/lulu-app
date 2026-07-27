import { create } from 'zustand';

import { ensureMedicationDoseHorizon } from '@/services/medications/ensure-dose-horizon';
import {
  deleteRemoteMedicationPlan,
  pushMedicationBundle,
  pushMedicationDoses,
  transitionRemoteMedicationDose,
} from '@/services/sync/medication-sync';
import * as medicationStorage from '@/storage/medication.storage';
import { useUserStore } from '@/stores/user.store';
import type { MedicationDose, MedicationPlanBundle } from '@/types/medication';
import { getStoreErrorKey } from '@/utils/store-error';

type MedicationState = {
  bundles: MedicationPlanBundle[];
  doses: MedicationDose[];
  isLoading: boolean;
  error: string | null;
  loadPlans: (petId: string) => Promise<void>;
  loadDoses: (petId: string, rangeStart: string, rangeEnd: string) => Promise<void>;
  savePlan: (bundle: MedicationPlanBundle) => Promise<void>;
  saveDoses: (doses: MedicationDose[]) => Promise<void>;
  takeDose: (id: string) => Promise<void>;
  skipDose: (id: string) => Promise<void>;
  snoozeDose: (id: string, minutes?: number) => Promise<void>;
  deletePlan: (id: string, petId: string) => Promise<void>;
  clearMedication: () => void;
  clearError: () => void;
};

async function readBundles(petId: string): Promise<MedicationPlanBundle[]> {
  const plans = await medicationStorage.getMedicationPlansByPetId(petId);
  return Promise.all(plans.map(async (plan) => ({
    plan,
    schedules: await medicationStorage.getMedicationSchedulesByPlanId(plan.id),
    inventory: await medicationStorage.getMedicationInventoryByPlanId(plan.id),
  })));
}

export const useMedicationStore = create<MedicationState>((set, get) => {
  const transitionDose = async (
    id: string,
    status: 'taken' | 'skipped' | 'snoozed',
    snoozeMinutes = 30
  ) => {
    const dose = await medicationStorage.getMedicationDoseById(id);
    if (!dose || dose.status === 'taken' || dose.status === 'skipped') return;
    const now = new Date();
    const updated: MedicationDose = {
      ...dose,
      status,
      completedAt: status === 'snoozed' ? null : now.toISOString(),
      actorUserId: status === 'snoozed' ? dose.actorUserId : useUserStore.getState().userId,
      snoozedUntil: status === 'snoozed'
        ? new Date(now.getTime() + snoozeMinutes * 60_000).toISOString()
        : null,
      updatedAt: now.toISOString(),
    };
    await medicationStorage.updateMedicationDose(updated);
    if (status === 'taken') {
      await medicationStorage.decrementMedicationInventory(dose.planId, updated.updatedAt);
      try {
        const { notifyMedicationRefillIfNeeded } = await import(
          '@/services/notifications/medication-refill'
        );
        await notifyMedicationRefillIfNeeded(dose.planId, dose.petId);
      } catch (error) {
        console.warn('Failed to deliver medication refill notification', error);
      }
    }
    set({ doses: get().doses.map((item) => item.id === id ? updated : item) });
    if (useUserStore.getState().userId) {
      try { await transitionRemoteMedicationDose(updated); }
      catch (error) { console.warn('Failed to sync medication dose transition', error); }
    }
    try {
      const { syncMedicationDoseNotificationSchedule } = await import(
        '@/services/notifications/medication-dose-schedule'
      );
      await syncMedicationDoseNotificationSchedule();
    } catch (error) {
      console.warn('Failed to refresh medication dose notifications', error);
    }
  };

  return ({
  bundles: [], doses: [], isLoading: false, error: null,
  loadPlans: async (petId) => {
    set({ isLoading: true, error: null });
    try {
      await ensureMedicationDoseHorizon(petId);
      set({ bundles: await readBundles(petId), isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getStoreErrorKey(error, 'errors.loadMedicationPlans') });
    }
  },
  loadDoses: async (petId, rangeStart, rangeEnd) => {
    set({ isLoading: true, error: null });
    try {
      await ensureMedicationDoseHorizon(petId);
      const doses = await medicationStorage.getMedicationDosesByPetId(petId, rangeStart, rangeEnd);
      set({ doses, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getStoreErrorKey(error, 'errors.loadMedicationDoses') });
    }
  },
  savePlan: async (bundle) => {
    set({ isLoading: true, error: null });
    try {
      await medicationStorage.upsertMedicationBundle(bundle);
      const userId = useUserStore.getState().userId;
      if (userId) {
        try { await pushMedicationBundle(userId, bundle); }
        catch (error) { console.warn('Failed to sync medication plan', error); }
      }
      await ensureMedicationDoseHorizon(bundle.plan.petId);
      try {
        const { syncMedicationDoseNotificationSchedule } = await import(
          '@/services/notifications/medication-dose-schedule'
        );
        await syncMedicationDoseNotificationSchedule();
      } catch (error) {
        console.warn('Failed to sync medication dose notifications', error);
      }
      set({ bundles: await readBundles(bundle.plan.petId), isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getStoreErrorKey(error, 'errors.saveMedicationPlan') });
      throw error;
    }
  },
  takeDose: async (id) => {
    set({ error: null });
    try { await transitionDose(id, 'taken'); }
    catch (error) { set({ error: getStoreErrorKey(error, 'errors.updateMedicationDose') }); throw error; }
  },
  skipDose: async (id) => {
    set({ error: null });
    try { await transitionDose(id, 'skipped'); }
    catch (error) { set({ error: getStoreErrorKey(error, 'errors.updateMedicationDose') }); throw error; }
  },
  snoozeDose: async (id, minutes = 30) => {
    set({ error: null });
    try { await transitionDose(id, 'snoozed', minutes); }
    catch (error) { set({ error: getStoreErrorKey(error, 'errors.updateMedicationDose') }); throw error; }
  },
  saveDoses: async (doses) => {
    if (doses.length === 0) return;
    set({ isLoading: true, error: null });
    try {
      await medicationStorage.upsertMedicationDoses(doses);
      if (useUserStore.getState().userId) {
        try { await pushMedicationDoses(doses); }
        catch (error) { console.warn('Failed to sync medication doses', error); }
      }
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getStoreErrorKey(error, 'errors.saveMedicationDoses') });
      throw error;
    }
  },
  deletePlan: async (id, petId) => {
    set({ isLoading: true, error: null });
    try {
      await medicationStorage.deleteMedicationPlan(id);
      if (useUserStore.getState().userId) {
        try { await deleteRemoteMedicationPlan(id); }
        catch (error) { console.warn('Failed to delete medication plan', error); }
      }
      set({ bundles: await readBundles(petId), isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getStoreErrorKey(error, 'errors.deleteMedicationPlan') });
      throw error;
    }
  },
  clearMedication: () => set({ bundles: [], doses: [], error: null }),
  clearError: () => set({ error: null }),
  });
});
