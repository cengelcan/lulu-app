import type {
  MedicationDose,
  MedicationInventory,
  MedicationPlan,
  MedicationPlanBundle,
  MedicationSchedule,
} from '@/types/medication';
import type { ReminderTimeOfDay } from '@/types/pet-reminder';

import { getDatabase } from './database';

type MedicationPlanRow = {
  id: string; pet_id: string; name: string; form: string | null; dosage: string; unit: string;
  instructions: string | null; starts_on: string; ends_on: string | null; timezone: string;
  is_prn: number; status: MedicationPlan['status']; created_at: string; updated_at: string;
};

type MedicationScheduleRow = {
  id: string; plan_id: string; frequency: MedicationSchedule['frequency']; interval_value: number;
  weekdays: string; times: string; effective_from: string; effective_to: string | null;
  created_at: string; updated_at: string;
};

type MedicationDoseRow = {
  id: string; plan_id: string; schedule_id: string | null; pet_id: string; scheduled_at: string;
  local_date: string; local_time: string; timezone: string; status: MedicationDose['status'];
  completed_at: string | null; actor_user_id: string | null; note: string | null;
  snoozed_until: string | null; created_at: string; updated_at: string;
};

type MedicationInventoryRow = {
  plan_id: string; pet_id: string; remaining_doses: number; refill_threshold: number; updated_at: string;
};

function parseJsonArray<T>(value: string): T[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
}

function parseTime(value: string): ReminderTimeOfDay {
  try {
    const parsed = JSON.parse(value) as Partial<ReminderTimeOfDay>;
    if (
      typeof parsed.hour === 'number' && parsed.hour >= 0 && parsed.hour <= 23 &&
      typeof parsed.minute === 'number' && parsed.minute >= 0 && parsed.minute <= 59
    ) {
      return { hour: parsed.hour, minute: parsed.minute };
    }
  } catch {
    // Fall through to the safe display default for malformed legacy rows.
  }
  return { hour: 9, minute: 0 };
}

function mapPlan(row: MedicationPlanRow): MedicationPlan {
  return {
    id: row.id, petId: row.pet_id, name: row.name, form: row.form, dosage: row.dosage,
    unit: row.unit, instructions: row.instructions, startsOn: row.starts_on, endsOn: row.ends_on,
    timezone: row.timezone, isPrn: row.is_prn === 1, status: row.status,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function mapSchedule(row: MedicationScheduleRow): MedicationSchedule {
  return {
    id: row.id, planId: row.plan_id, frequency: row.frequency, interval: row.interval_value,
    weekdays: parseJsonArray<number>(row.weekdays),
    times: parseJsonArray<ReminderTimeOfDay>(row.times), effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function mapDose(row: MedicationDoseRow): MedicationDose {
  return {
    id: row.id, planId: row.plan_id, scheduleId: row.schedule_id, petId: row.pet_id,
    scheduledAt: row.scheduled_at, localDate: row.local_date, localTime: parseTime(row.local_time), timezone: row.timezone,
    status: row.status, completedAt: row.completed_at, actorUserId: row.actor_user_id,
    note: row.note, snoozedUntil: row.snoozed_until, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function mapInventory(row: MedicationInventoryRow): MedicationInventory {
  return {
    planId: row.plan_id, petId: row.pet_id, remainingDoses: row.remaining_doses,
    refillThreshold: row.refill_threshold, updatedAt: row.updated_at,
  };
}

export async function upsertMedicationInventory(inventory: MedicationInventory): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO medication_inventory (plan_id, pet_id, remaining_doses, refill_threshold, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(plan_id) DO UPDATE SET
       pet_id=excluded.pet_id, remaining_doses=excluded.remaining_doses,
       refill_threshold=excluded.refill_threshold, updated_at=excluded.updated_at`,
    inventory.planId, inventory.petId, Math.max(0, Math.floor(inventory.remainingDoses)),
    Math.max(0, Math.floor(inventory.refillThreshold)), inventory.updatedAt
  );
}

export async function getMedicationInventoryByPlanId(planId: string): Promise<MedicationInventory | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<MedicationInventoryRow>(
    'SELECT * FROM medication_inventory WHERE plan_id = ?', planId
  );
  return row ? mapInventory(row) : null;
}

export async function getMedicationInventoryByPetId(petId: string): Promise<MedicationInventory[]> {
  const db = await getDatabase();
  return (await db.getAllAsync<MedicationInventoryRow>(
    'SELECT * FROM medication_inventory WHERE pet_id = ? ORDER BY remaining_doses ASC', petId
  )).map(mapInventory);
}

export async function decrementMedicationInventory(planId: string, updatedAt: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE medication_inventory
     SET remaining_doses = MAX(0, remaining_doses - 1), updated_at = ?
     WHERE plan_id = ?`,
    updatedAt, planId
  );
}

export async function upsertMedicationPlan(plan: MedicationPlan): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO medication_plans (
      id, pet_id, name, form, dosage, unit, instructions, starts_on, ends_on, timezone,
      is_prn, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      pet_id=excluded.pet_id, name=excluded.name, form=excluded.form, dosage=excluded.dosage,
      unit=excluded.unit, instructions=excluded.instructions, starts_on=excluded.starts_on,
      ends_on=excluded.ends_on, timezone=excluded.timezone, is_prn=excluded.is_prn,
      status=excluded.status, updated_at=excluded.updated_at`,
    plan.id, plan.petId, plan.name, plan.form ?? null, plan.dosage, plan.unit,
    plan.instructions ?? null, plan.startsOn, plan.endsOn ?? null, plan.timezone,
    plan.isPrn ? 1 : 0, plan.status, plan.createdAt, plan.updatedAt
  );
}

export async function replaceMedicationSchedules(
  planId: string,
  schedules: MedicationSchedule[]
): Promise<void> {
  const db = await getDatabase();
  for (const schedule of schedules) {
    await db.runAsync(
      `INSERT INTO medication_schedules (
        id, plan_id, frequency, interval_value, weekdays, times, effective_from, effective_to,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        frequency=excluded.frequency, interval_value=excluded.interval_value,
        weekdays=excluded.weekdays, times=excluded.times, effective_from=excluded.effective_from,
        effective_to=excluded.effective_to, updated_at=excluded.updated_at`,
      schedule.id, schedule.planId, schedule.frequency, Math.max(1, schedule.interval),
      JSON.stringify(schedule.weekdays), JSON.stringify(schedule.times), schedule.effectiveFrom,
      schedule.effectiveTo ?? null, schedule.createdAt, schedule.updatedAt
    );
  }
  const existing = await db.getAllAsync<{ id: string }>(
    'SELECT id FROM medication_schedules WHERE plan_id = ?', planId
  );
  const desiredIds = new Set(schedules.map((schedule) => schedule.id));
  for (const row of existing) {
    if (!desiredIds.has(row.id)) {
      await db.runAsync('DELETE FROM medication_schedules WHERE id = ?', row.id);
    }
  }
}

export async function upsertMedicationBundle(bundle: MedicationPlanBundle): Promise<void> {
  await upsertMedicationPlan(bundle.plan);
  await replaceMedicationSchedules(bundle.plan.id, bundle.schedules);
  if (bundle.inventory) await upsertMedicationInventory(bundle.inventory);
}

export async function getMedicationPlansByPetId(petId: string): Promise<MedicationPlan[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<MedicationPlanRow>(
    'SELECT * FROM medication_plans WHERE pet_id = ? ORDER BY status ASC, starts_on DESC', petId
  );
  return rows.map(mapPlan);
}

export async function getAllMedicationPlans(): Promise<MedicationPlan[]> {
  const db = await getDatabase();
  return (await db.getAllAsync<MedicationPlanRow>('SELECT * FROM medication_plans')).map(mapPlan);
}

export async function getMedicationSchedulesByPlanId(planId: string): Promise<MedicationSchedule[]> {
  const db = await getDatabase();
  return (await db.getAllAsync<MedicationScheduleRow>(
    'SELECT * FROM medication_schedules WHERE plan_id = ? ORDER BY created_at ASC', planId
  )).map(mapSchedule);
}

export async function getMedicationBundle(planId: string): Promise<MedicationPlanBundle | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<MedicationPlanRow>('SELECT * FROM medication_plans WHERE id = ?', planId);
  if (!row) return null;
  return {
    plan: mapPlan(row),
    schedules: await getMedicationSchedulesByPlanId(planId),
    inventory: await getMedicationInventoryByPlanId(planId),
  };
}

export async function upsertMedicationDoses(doses: MedicationDose[]): Promise<void> {
  const db = await getDatabase();
  for (const dose of doses) {
    await db.runAsync(
      `INSERT INTO medication_doses (
        id, plan_id, schedule_id, pet_id, scheduled_at, local_date, local_time, timezone, status,
        completed_at, actor_user_id, note, snoozed_until, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        schedule_id=excluded.schedule_id, status=excluded.status, completed_at=excluded.completed_at,
        actor_user_id=excluded.actor_user_id, note=excluded.note,
        snoozed_until=excluded.snoozed_until, updated_at=excluded.updated_at`,
      dose.id, dose.planId, dose.scheduleId ?? null, dose.petId, dose.scheduledAt, dose.localDate,
      JSON.stringify(dose.localTime), dose.timezone, dose.status, dose.completedAt ?? null,
      dose.actorUserId ?? null, dose.note ?? null, dose.snoozedUntil ?? null,
      dose.createdAt, dose.updatedAt
    );
  }
}

export async function insertMedicationDosesIfMissing(doses: MedicationDose[]): Promise<void> {
  const db = await getDatabase();
  for (const dose of doses) {
    await db.runAsync(
      `INSERT OR IGNORE INTO medication_doses (
        id, plan_id, schedule_id, pet_id, scheduled_at, local_date, local_time, timezone, status,
        completed_at, actor_user_id, note, snoozed_until, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      dose.id, dose.planId, dose.scheduleId ?? null, dose.petId, dose.scheduledAt, dose.localDate,
      JSON.stringify(dose.localTime), dose.timezone, dose.status, dose.completedAt ?? null,
      dose.actorUserId ?? null, dose.note ?? null, dose.snoozedUntil ?? null,
      dose.createdAt, dose.updatedAt
    );
  }
}

export async function getMedicationDoseById(id: string): Promise<MedicationDose | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<MedicationDoseRow>('SELECT * FROM medication_doses WHERE id = ?', id);
  return row ? mapDose(row) : null;
}

export async function updateMedicationDose(dose: MedicationDose): Promise<void> {
  await upsertMedicationDoses([dose]);
}

export async function deleteMedicationDose(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM medication_doses WHERE id = ?', id);
}

export async function getUpcomingMedicationDosesByPetId(
  petId: string,
  afterIso: string
): Promise<MedicationDose[]> {
  const db = await getDatabase();
  return (await db.getAllAsync<MedicationDoseRow>(
    `SELECT * FROM medication_doses
     WHERE pet_id = ?
       AND status IN ('scheduled', 'snoozed')
       AND COALESCE(snoozed_until, scheduled_at) > ?
     ORDER BY COALESCE(snoozed_until, scheduled_at) ASC`,
    petId,
    afterIso
  )).map(mapDose);
}

export async function getMedicationDosesByPetId(
  petId: string,
  rangeStart: string,
  rangeEnd: string
): Promise<MedicationDose[]> {
  const db = await getDatabase();
  return (await db.getAllAsync<MedicationDoseRow>(
    `SELECT * FROM medication_doses
     WHERE pet_id = ? AND local_date >= ? AND local_date <= ?
     ORDER BY scheduled_at ASC`, petId, rangeStart, rangeEnd
  )).map(mapDose);
}

export async function deleteMedicationPlan(id: string): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'UPDATE vet_visit_outcomes SET medication_plan_id = NULL WHERE medication_plan_id = ?',
      id
    );
    await db.runAsync('DELETE FROM medication_plans WHERE id = ?', id);
  });
}

export async function deleteAllMedicationData(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync('DELETE FROM medication_doses; DELETE FROM medication_inventory; DELETE FROM medication_schedules; DELETE FROM medication_plans;');
}
