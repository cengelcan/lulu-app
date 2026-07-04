import { supabase } from '@/lib/supabase';
import { logActivityEvent } from '@/services/sharing/family-sharing';
import * as petReminderStorage from '@/storage/pet-reminder.storage';
import type { PetReminder, ReminderTimeOfDay } from '@/types/pet-reminder';
import { normalizePetReminder, mergeStoredReminderMetadata, splitStoredReminderMetadata } from '@/utils/pet-reminder-normalize';
import { isReminderTypeId } from '@/types/pet-reminder';
import { DEFAULT_REMINDER_TIME } from '@/types/reminder';

type RemotePetReminderRow = {
  id: string;
  user_id: string;
  pet_id: string;
  type: string;
  due_date: string;
  due_time: ReminderTimeOfDay | null;
  notes: string | null;
  status: string;
  completed_at: string | null;
  skipped_at: string | null;
  record_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

function toRemoteRow(reminder: PetReminder, userId: string): Record<string, unknown> {
  const normalized = normalizePetReminder(reminder);

  return {
    id: normalized.id,
    user_id: userId,
    pet_id: normalized.petId,
    type: normalized.type,
    due_date: normalized.dueDate,
    due_time: normalized.dueTime,
    notes: normalized.notes ?? null,
    status: normalized.status,
    completed_at: normalized.completedAt ?? null,
    skipped_at: normalized.skippedAt ?? null,
    record_id: normalized.recordId ?? null,
    metadata: mergeStoredReminderMetadata(normalized),
    created_at: normalized.createdAt,
    updated_at: normalized.updatedAt,
  };
}

function fromRemoteRow(row: RemotePetReminderRow): PetReminder {
  if (!isReminderTypeId(row.type)) {
    throw new Error(`Unknown pet reminder type: ${row.type}`);
  }

  const { metadata, recurrence } = splitStoredReminderMetadata(row.type, row.metadata);

  return normalizePetReminder({
    id: row.id,
    petId: row.pet_id,
    dueDate: row.due_date,
    dueTime: row.due_time ?? { ...DEFAULT_REMINDER_TIME },
    notes: row.notes,
    recurrence,
    status: row.status,
    completedAt: row.completed_at,
    skippedAt: row.skipped_at ?? (row.status === 'skipped' ? row.updated_at : null),
    recordId: row.record_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    type: row.type,
    metadata,
  } as PetReminder);
}

export async function fetchRemotePetReminders(_userId: string): Promise<PetReminder[]> {
  const { data, error } = await supabase
    .from('pet_reminders')
    .select('*')
    .order('due_date', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as RemotePetReminderRow[]).map(fromRemoteRow);
}

export async function pushPetReminder(userId: string, reminder: PetReminder): Promise<void> {
  const { error } = await supabase.from('pet_reminders').upsert(toRemoteRow(reminder, userId), {
    onConflict: 'id',
  });

  if (error) {
    throw new Error(error.message);
  }

  if (reminder.status === 'completed') {
    void logActivityEvent({
      id: `reminder-${reminder.id}-completed`,
      petId: reminder.petId,
      eventType: 'reminder_completed',
      metadata: { type: reminder.type },
    });
  }
}

export async function deleteRemotePetReminder(id: string): Promise<void> {
  const { error } = await supabase.from('pet_reminders').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Reconciles local pet reminders with Supabase (the source of truth).
 *
 * Transition case: when the cloud has none yet but the device has local
 * reminders, those are pushed up (claimed for this user). Otherwise the local
 * cache is replaced with the cloud rows.
 *
 * Must run AFTER pets are pulled so the cloud FK (pet_reminders.pet_id → pets.id)
 * is satisfied when pushing local rows up.
 */
export async function pullPetRemindersIntoLocal(userId: string): Promise<PetReminder[]> {
  const remoteReminders = await fetchRemotePetReminders(userId);

  if (remoteReminders.length === 0) {
    const localReminders = await petReminderStorage.getAllPetReminders();

    if (localReminders.length > 0) {
      for (const reminder of localReminders) {
        await pushPetReminder(userId, reminder);
      }

      return localReminders;
    }

    return [];
  }

  await petReminderStorage.deleteAllPetReminders();
  for (const reminder of remoteReminders) {
    await petReminderStorage.createPetReminder(reminder);
  }

  return remoteReminders;
}
