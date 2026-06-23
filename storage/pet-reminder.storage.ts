import type { PetReminder, ReminderTimeOfDay, ReminderTypeId } from '@/types/pet-reminder';
import { isReminderTypeId } from '@/types/pet-reminder';
import {
  mergeStoredReminderMetadata,
  normalizePetReminder,
  splitStoredReminderMetadata,
} from '@/utils/pet-reminder-normalize';

import { getDatabase } from './database';

type PetReminderRow = {
  id: string;
  pet_id: string;
  type: string;
  due_date: string;
  due_time: string | null;
  notes: string | null;
  status: string;
  completed_at: string | null;
  record_id: string | null;
  metadata: string;
  created_at: string;
  updated_at: string;
};

function parseDueTime(value: string | null): ReminderTimeOfDay | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as ReminderTimeOfDay;
    if (
      typeof parsed.hour === 'number' &&
      typeof parsed.minute === 'number' &&
      parsed.hour >= 0 &&
      parsed.hour <= 23 &&
      parsed.minute >= 0 &&
      parsed.minute <= 59
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

function serializeDueTime(value: ReminderTimeOfDay): string {
  return JSON.stringify(value);
}

function mapPetReminderRow(row: PetReminderRow): PetReminder {
  if (!isReminderTypeId(row.type)) {
    throw new Error(`Unknown pet reminder type: ${row.type}`);
  }

  let rawMetadata: unknown;

  try {
    rawMetadata = JSON.parse(row.metadata);
  } catch {
    rawMetadata = {};
  }

  const { metadata, recurrence } = splitStoredReminderMetadata(row.type, rawMetadata);
  const dueTime = parseDueTime(row.due_time);

  return normalizePetReminder({
    id: row.id,
    petId: row.pet_id,
    dueDate: row.due_date,
    dueTime: dueTime ?? { hour: 9, minute: 0 },
    notes: row.notes,
    recurrence,
    status: row.status,
    completedAt: row.completed_at,
    skippedAt: row.status === 'skipped' ? row.updated_at : null,
    recordId: row.record_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    type: row.type,
    metadata,
  } as PetReminder);
}

export async function createPetReminder(reminder: PetReminder): Promise<void> {
  const db = await getDatabase();
  const normalized = normalizePetReminder(reminder);

  await db.runAsync(
    `INSERT INTO pet_reminders (
      id, pet_id, type, due_date, due_time, notes, status, completed_at, record_id, metadata, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    normalized.id,
    normalized.petId,
    normalized.type,
    normalized.dueDate,
    serializeDueTime(normalized.dueTime),
    normalized.notes ?? null,
    normalized.status,
    normalized.completedAt ?? null,
    normalized.recordId ?? null,
    JSON.stringify(mergeStoredReminderMetadata(normalized)),
    normalized.createdAt,
    normalized.updatedAt
  );
}

export async function getPetReminderById(id: string): Promise<PetReminder | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<PetReminderRow>('SELECT * FROM pet_reminders WHERE id = ?', id);

  return row ? mapPetReminderRow(row) : null;
}

export async function getPetRemindersByPetId(petId: string): Promise<PetReminder[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PetReminderRow>(
    `SELECT * FROM pet_reminders
     WHERE pet_id = ?
     ORDER BY due_date ASC, created_at ASC`,
    petId
  );

  return rows.map(mapPetReminderRow);
}

export async function getPendingPetRemindersByPetId(petId: string): Promise<PetReminder[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PetReminderRow>(
    `SELECT * FROM pet_reminders
     WHERE pet_id = ? AND status = 'pending'
     ORDER BY due_date ASC, created_at ASC`,
    petId
  );

  return rows.map(mapPetReminderRow);
}

export async function getCompletedPetRemindersByPetId(petId: string): Promise<PetReminder[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PetReminderRow>(
    `SELECT * FROM pet_reminders
     WHERE pet_id = ? AND status = 'completed'
     ORDER BY completed_at DESC, due_date DESC`,
    petId
  );

  return rows.map(mapPetReminderRow);
}

export async function getAllPetReminders(): Promise<PetReminder[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PetReminderRow>(
    'SELECT * FROM pet_reminders ORDER BY due_date ASC, created_at ASC'
  );

  return rows.map(mapPetReminderRow);
}

export async function getPetRemindersByPetIdAndType(
  petId: string,
  type: ReminderTypeId
): Promise<PetReminder[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PetReminderRow>(
    `SELECT * FROM pet_reminders
     WHERE pet_id = ? AND type = ?
     ORDER BY due_date ASC, created_at ASC`,
    petId,
    type
  );

  return rows.map(mapPetReminderRow);
}

export async function updatePetReminder(reminder: PetReminder): Promise<void> {
  const db = await getDatabase();
  const normalized = normalizePetReminder(reminder);

  await db.runAsync(
    `UPDATE pet_reminders
     SET type = ?, due_date = ?, due_time = ?, notes = ?, status = ?, completed_at = ?, record_id = ?, metadata = ?, updated_at = ?
     WHERE id = ?`,
    normalized.type,
    normalized.dueDate,
    serializeDueTime(normalized.dueTime),
    normalized.notes ?? null,
    normalized.status,
    normalized.completedAt ?? null,
    normalized.recordId ?? null,
    JSON.stringify(mergeStoredReminderMetadata(normalized)),
    normalized.updatedAt,
    normalized.id
  );
}

export async function deletePetReminder(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM pet_reminders WHERE id = ?', id);
}

export async function deleteAllPetReminders(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync('DELETE FROM pet_reminders');
}
