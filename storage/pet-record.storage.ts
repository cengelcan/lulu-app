import {
  createDefaultMetadata,
  isRecordTypeId,
  type PetRecord,
  type PetRecordMetadataByType,
  type RecordTypeId,
} from '@/types/pet-record';

import { getDatabase } from './database';

type PetRecordRow = {
  id: string;
  pet_id: string;
  type: string;
  date: string;
  notes: string | null;
  metadata: string;
  created_at: string;
  updated_at: string;
};

function parseMetadata<T extends RecordTypeId>(
  type: T,
  raw: string
): PetRecordMetadataByType[T] {
  try {
    const parsed = JSON.parse(raw) as Partial<PetRecordMetadataByType[T]>;
    return { ...createDefaultMetadata(type), ...parsed };
  } catch {
    return createDefaultMetadata(type);
  }
}

function mapPetRecordRow(row: PetRecordRow): PetRecord {
  if (!isRecordTypeId(row.type)) {
    throw new Error(`Unknown pet record type: ${row.type}`);
  }

  const base = {
    id: row.id,
    petId: row.pet_id,
    date: row.date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  const metadata = parseMetadata(row.type, row.metadata);

  return {
    ...base,
    type: row.type,
    metadata,
  } as PetRecord;
}

export async function createPetRecord(record: PetRecord): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT INTO pet_records (
      id, pet_id, type, date, notes, metadata, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    record.id,
    record.petId,
    record.type,
    record.date,
    record.notes ?? null,
    JSON.stringify(record.metadata),
    record.createdAt,
    record.updatedAt
  );
}

export async function getPetRecordById(id: string): Promise<PetRecord | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<PetRecordRow>('SELECT * FROM pet_records WHERE id = ?', id);

  return row ? mapPetRecordRow(row) : null;
}

export async function getPetRecordsByPetId(petId: string): Promise<PetRecord[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PetRecordRow>(
    `SELECT * FROM pet_records
     WHERE pet_id = ?
     ORDER BY date DESC, created_at DESC`,
    petId
  );

  return rows.map(mapPetRecordRow);
}

export async function getPetRecordsByPetIdAndType(
  petId: string,
  type: RecordTypeId
): Promise<PetRecord[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PetRecordRow>(
    `SELECT * FROM pet_records
     WHERE pet_id = ? AND type = ?
     ORDER BY date DESC, created_at DESC`,
    petId,
    type
  );

  return rows.map(mapPetRecordRow);
}

export async function getPetRecordsByPetIdAndDateRange(
  petId: string,
  startDate: string,
  endDate: string
): Promise<PetRecord[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PetRecordRow>(
    `SELECT * FROM pet_records
     WHERE pet_id = ? AND date >= ? AND date <= ?
     ORDER BY date DESC, created_at DESC`,
    petId,
    startDate,
    endDate
  );

  return rows.map(mapPetRecordRow);
}

export async function updatePetRecord(record: PetRecord): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `UPDATE pet_records
     SET type = ?, date = ?, notes = ?, metadata = ?, updated_at = ?
     WHERE id = ?`,
    record.type,
    record.date,
    record.notes ?? null,
    JSON.stringify(record.metadata),
    record.updatedAt,
    record.id
  );
}

export async function deletePetRecord(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM pet_records WHERE id = ?', id);
}

export async function deleteAllPetRecords(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync('DELETE FROM pet_records');
}
