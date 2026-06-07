import type { Appetite, CheckIn, Energy, Symptom } from '@/types/check-in';

import { getDatabase } from './database';

type CheckInRow = {
  id: string;
  pet_id: string;
  date: string;
  appetite: string;
  energy: string;
  symptom: string;
  created_at: string;
};

function mapCheckInRow(row: CheckInRow): CheckIn {
  return {
    id: row.id,
    petId: row.pet_id,
    date: row.date,
    appetite: row.appetite as Appetite,
    energy: row.energy as Energy,
    symptom: row.symptom as Symptom,
    createdAt: row.created_at,
  };
}

export async function createCheckIn(checkIn: CheckIn): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT INTO check_ins (id, pet_id, date, appetite, energy, symptom, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    checkIn.id,
    checkIn.petId,
    checkIn.date,
    checkIn.appetite,
    checkIn.energy,
    checkIn.symptom,
    checkIn.createdAt
  );
}

export async function getCheckInById(id: string): Promise<CheckIn | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<CheckInRow>('SELECT * FROM check_ins WHERE id = ?', id);

  return row ? mapCheckInRow(row) : null;
}

export async function getLatestCheckInByPetId(petId: string): Promise<CheckIn | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<CheckInRow>(
    `SELECT * FROM check_ins
     WHERE pet_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    petId
  );

  return row ? mapCheckInRow(row) : null;
}

export async function getCheckInsByPetId(petId: string): Promise<CheckIn[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CheckInRow>(
    `SELECT * FROM check_ins
     WHERE pet_id = ?
     ORDER BY created_at DESC`,
    petId
  );

  return rows.map(mapCheckInRow);
}

export async function updateCheckIn(checkIn: CheckIn): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `UPDATE check_ins
     SET date = ?, appetite = ?, energy = ?, symptom = ?
     WHERE id = ?`,
    checkIn.date,
    checkIn.appetite,
    checkIn.energy,
    checkIn.symptom,
    checkIn.id
  );
}

export async function deleteCheckIn(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM check_ins WHERE id = ?', id);
}
