import { supabase } from '@/lib/supabase';
import * as petRecordStorage from '@/storage/pet-record.storage';
import {
  createDefaultMetadata,
  isRecordTypeId,
  type PetRecord,
} from '@/types/pet-record';

type RemotePetRecordRow = {
  id: string;
  user_id: string;
  pet_id: string;
  type: string;
  date: string;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

function toRemoteRow(record: PetRecord, userId: string): Record<string, unknown> {
  return {
    id: record.id,
    user_id: userId,
    pet_id: record.petId,
    type: record.type,
    date: record.date,
    notes: record.notes ?? null,
    metadata: record.metadata,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

function fromRemoteRow(row: RemotePetRecordRow): PetRecord {
  if (!isRecordTypeId(row.type)) {
    throw new Error(`Unknown pet record type: ${row.type}`);
  }

  const metadata = {
    ...createDefaultMetadata(row.type),
    ...(row.metadata ?? {}),
  };

  return {
    id: row.id,
    petId: row.pet_id,
    date: row.date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    type: row.type,
    metadata,
  } as PetRecord;
}

export async function fetchRemotePetRecords(userId: string): Promise<PetRecord[]> {
  const { data, error } = await supabase
    .from('pet_records')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as RemotePetRecordRow[]).map(fromRemoteRow);
}

export async function pushPetRecord(userId: string, record: PetRecord): Promise<void> {
  const { error } = await supabase.from('pet_records').upsert(toRemoteRow(record, userId), {
    onConflict: 'id',
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteRemotePetRecord(id: string): Promise<void> {
  const { error } = await supabase.from('pet_records').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Reconciles local pet records with Supabase (the source of truth).
 *
 * Transition case: when the cloud has none yet but the device has local
 * records, those are pushed up (claimed for this user). Otherwise the local
 * cache is replaced with the cloud rows.
 *
 * Must run AFTER pets are pulled so the cloud FK (pet_records.pet_id → pets.id)
 * is satisfied when pushing local rows up.
 */
export async function pullPetRecordsIntoLocal(userId: string): Promise<PetRecord[]> {
  const remoteRecords = await fetchRemotePetRecords(userId);

  if (remoteRecords.length === 0) {
    const localRecords = await petRecordStorage.getAllPetRecords();

    if (localRecords.length > 0) {
      for (const record of localRecords) {
        await pushPetRecord(userId, record);
      }

      return localRecords;
    }

    return [];
  }

  await petRecordStorage.deleteAllPetRecords();
  for (const record of remoteRecords) {
    await petRecordStorage.createPetRecord(record);
  }

  return remoteRecords;
}
