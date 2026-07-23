import { supabase } from '@/lib/supabase';
import { getLocalOwnedPetIds } from '@/services/sync/local-owned-pet-ids';
import * as medicationStorage from '@/storage/medication.storage';
import type {
  MedicationDose,
  MedicationInventory,
  MedicationPlan,
  MedicationPlanBundle,
  MedicationSchedule,
} from '@/types/medication';
import type { ReminderTimeOfDay } from '@/types/pet-reminder';

type RemotePlanRow = {
  id: string; user_id: string; pet_id: string; name: string; form: string | null;
  dosage: string; unit: string; instructions: string | null; starts_on: string;
  ends_on: string | null; timezone: string; is_prn: boolean; status: MedicationPlan['status'];
  created_at: string; updated_at: string;
};
type RemoteScheduleRow = {
  id: string; plan_id: string; frequency: MedicationSchedule['frequency']; interval_value: number;
  weekdays: number[]; times: ReminderTimeOfDay[]; effective_from: string; effective_to: string | null;
  created_at: string; updated_at: string;
};
type RemoteDoseRow = {
  id: string; plan_id: string; schedule_id: string | null; pet_id: string; scheduled_at: string;
  local_date: string; local_time: ReminderTimeOfDay; timezone: string; status: MedicationDose['status'];
  completed_at: string | null; actor_user_id: string | null; note: string | null;
  snoozed_until: string | null; created_at: string; updated_at: string;
};
type RemoteInventoryRow = {
  plan_id: string; pet_id: string; remaining_doses: number; refill_threshold: number; updated_at: string;
};

function fromPlanRow(row: RemotePlanRow): MedicationPlan {
  return {
    id: row.id, petId: row.pet_id, name: row.name, form: row.form, dosage: row.dosage,
    unit: row.unit, instructions: row.instructions, startsOn: row.starts_on, endsOn: row.ends_on,
    timezone: row.timezone, isPrn: row.is_prn, status: row.status,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function fromScheduleRow(row: RemoteScheduleRow): MedicationSchedule {
  return {
    id: row.id, planId: row.plan_id, frequency: row.frequency, interval: row.interval_value,
    weekdays: row.weekdays ?? [], times: row.times ?? [], effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function fromDoseRow(row: RemoteDoseRow): MedicationDose {
  return {
    id: row.id, planId: row.plan_id, scheduleId: row.schedule_id, petId: row.pet_id,
    scheduledAt: row.scheduled_at, localDate: row.local_date, localTime: row.local_time,
    timezone: row.timezone, status: row.status, completedAt: row.completed_at,
    actorUserId: row.actor_user_id, note: row.note, snoozedUntil: row.snoozed_until,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function fromInventoryRow(row: RemoteInventoryRow): MedicationInventory {
  return {
    planId: row.plan_id, petId: row.pet_id, remainingDoses: row.remaining_doses,
    refillThreshold: row.refill_threshold, updatedAt: row.updated_at,
  };
}

export async function pushMedicationBundle(userId: string, bundle: MedicationPlanBundle): Promise<void> {
  const { plan, schedules } = bundle;
  const planValues = {
    pet_id: plan.petId, name: plan.name, form: plan.form ?? null,
    dosage: plan.dosage, unit: plan.unit, instructions: plan.instructions ?? null,
    starts_on: plan.startsOn, ends_on: plan.endsOn ?? null, timezone: plan.timezone,
    is_prn: plan.isPrn, status: plan.status, created_at: plan.createdAt, updated_at: plan.updatedAt,
  };
  const { data: existingPlan, error: lookupError } = await supabase
    .from('medication_plans').select('id').eq('id', plan.id).maybeSingle();
  if (lookupError) throw new Error(lookupError.message);
  const { error: planError } = existingPlan
    ? await supabase.from('medication_plans').update(planValues).eq('id', plan.id)
    : await supabase.from('medication_plans').insert({ id: plan.id, user_id: userId, ...planValues });
  if (planError) throw new Error(planError.message);

  if (bundle.inventory) {
    const inventory = bundle.inventory;
    const { error } = await supabase.rpc('set_medication_inventory', {
      p_plan_id: inventory.planId,
      p_remaining_doses: inventory.remainingDoses,
      p_refill_threshold: inventory.refillThreshold,
    });
    if (error) throw new Error(error.message);
  }

  const { data: existing, error: existingError } = await supabase
    .from('medication_schedules').select('id').eq('plan_id', plan.id);
  if (existingError) throw new Error(existingError.message);

  if (schedules.length > 0) {
    const { error } = await supabase.from('medication_schedules').upsert(schedules.map((schedule) => ({
      id: schedule.id, plan_id: schedule.planId, frequency: schedule.frequency,
      interval_value: Math.max(1, schedule.interval), weekdays: schedule.weekdays, times: schedule.times,
      effective_from: schedule.effectiveFrom, effective_to: schedule.effectiveTo ?? null,
      created_at: schedule.createdAt, updated_at: schedule.updatedAt,
    })), { onConflict: 'id' });
    if (error) throw new Error(error.message);
  }

  const desiredIds = new Set(schedules.map((schedule) => schedule.id));
  const staleIds = (existing ?? []).map((row) => row.id as string).filter((id) => !desiredIds.has(id));
  if (staleIds.length > 0) {
    const { error } = await supabase.from('medication_schedules').delete().in('id', staleIds);
    if (error) throw new Error(error.message);
  }
}

export async function pushMedicationDoses(
  doses: MedicationDose[],
  options: { preserveExisting?: boolean } = {}
): Promise<void> {
  if (doses.length === 0) return;
  const { error } = await supabase.from('medication_doses').upsert(doses.map((dose) => ({
    id: dose.id, plan_id: dose.planId, schedule_id: dose.scheduleId ?? null, pet_id: dose.petId,
    scheduled_at: dose.scheduledAt, local_date: dose.localDate, local_time: dose.localTime,
    timezone: dose.timezone, status: dose.status, completed_at: dose.completedAt ?? null,
    actor_user_id: dose.actorUserId ?? null, note: dose.note ?? null,
    snoozed_until: dose.snoozedUntil ?? null, created_at: dose.createdAt, updated_at: dose.updatedAt,
  })), { onConflict: 'id', ignoreDuplicates: options.preserveExisting ?? false });
  if (error) throw new Error(error.message);
}

export async function transitionRemoteMedicationDose(dose: MedicationDose): Promise<void> {
  const { error } = await supabase.rpc('transition_medication_dose', {
    p_dose_id: dose.id,
    p_status: dose.status,
    p_completed_at: dose.completedAt ?? null,
    p_snoozed_until: dose.snoozedUntil ?? null,
    p_note: dose.note ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function deleteRemoteMedicationPlan(id: string): Promise<void> {
  const { error } = await supabase.from('medication_plans').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteRemoteMedicationDoses(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase.from('medication_doses').delete().in('id', ids);
  if (error) throw new Error(error.message);
}

export async function pullMedicationIntoLocal(userId: string): Promise<void> {
  const [
    { data: planRows, error: planError },
    { data: scheduleRows, error: scheduleError },
    { data: doseRows, error: doseError },
    { data: inventoryRows, error: inventoryError },
  ] =
    await Promise.all([
      supabase.from('medication_plans').select('*').order('starts_on', { ascending: false }),
      supabase.from('medication_schedules').select('*'),
      supabase.from('medication_doses').select('*').order('scheduled_at', { ascending: true }),
      supabase.from('medication_inventory').select('*'),
    ]);
  if (planError) throw new Error(planError.message);
  if (scheduleError) throw new Error(scheduleError.message);
  if (doseError) throw new Error(doseError.message);
  if (inventoryError) throw new Error(inventoryError.message);

  const remotePlans = (planRows as RemotePlanRow[]).map(fromPlanRow);
  const remoteSchedules = (scheduleRows as RemoteScheduleRow[]).map(fromScheduleRow);
  const remoteDoses = (doseRows as RemoteDoseRow[]).map(fromDoseRow);
  const remoteInventory = (inventoryRows as RemoteInventoryRow[]).map(fromInventoryRow);

  if (remotePlans.length === 0) {
    const localPlans = await medicationStorage.getAllMedicationPlans();
    const ownedPetIds = await getLocalOwnedPetIds();
    const claimable = localPlans.filter((plan) => ownedPetIds.has(plan.petId));
    for (const plan of claimable) {
      await pushMedicationBundle(userId, {
        plan,
        schedules: await medicationStorage.getMedicationSchedulesByPlanId(plan.id),
        inventory: await medicationStorage.getMedicationInventoryByPlanId(plan.id),
      });
    }
    for (const plan of localPlans) {
      if (!ownedPetIds.has(plan.petId)) {
        await medicationStorage.deleteMedicationPlan(plan.id);
      }
    }
    return;
  }

  await medicationStorage.deleteAllMedicationData();
  for (const plan of remotePlans) {
    await medicationStorage.upsertMedicationBundle({
      plan,
      schedules: remoteSchedules.filter((schedule) => schedule.planId === plan.id),
      inventory: remoteInventory.find((inventory) => inventory.planId === plan.id) ?? null,
    });
  }
  await medicationStorage.upsertMedicationDoses(remoteDoses);
}
