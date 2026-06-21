import type {
  Appetite,
  CheckIn,
  Energy,
  Mood,
  Pee,
  Poop,
  WaterIntake,
} from '@/types/check-in';

import { getDatabase } from './database';

type CheckInRow = {
  id: string;
  pet_id: string;
  date: string;
  appetite: string;
  water_intake: string | null;
  energy: string;
  mood: string | null;
  pee: string | null;
  poop: string | null;
  symptom: string | null;
  notes: string | null;
  created_at: string;
};

function normalizeAppetite(value: string): Appetite {
  switch (value) {
    case 'good':
      return 'increased';
    case 'not_eating':
      return 'no_appetite';
    case 'no_appetite':
    case 'reduced':
    case 'normal':
    case 'increased':
      return value;
    default:
      return 'normal';
  }
}

function normalizeEnergy(value: string): Energy {
  switch (value) {
    case 'high':
      return 'high';
    case 'low':
      return 'low';
    case 'very_low':
    case 'normal':
    case 'very_high':
      return value;
    default:
      return 'normal';
  }
}

function normalizeWaterIntake(value: string | null): WaterIntake {
  if (
    value === 'very_low' ||
    value === 'low' ||
    value === 'normal' ||
    value === 'high' ||
    value === 'very_high'
  ) {
    return value;
  }

  return 'normal';
}

function normalizeMood(value: string | null): Mood {
  if (
    value === 'restless' ||
    value === 'irritable' ||
    value === 'normal' ||
    value === 'happy' ||
    value === 'playful'
  ) {
    return value;
  }

  return 'normal';
}

function normalizePee(value: string | null, symptom: string | null): Pee {
  if (
    value === 'straining' ||
    value === 'less_than_normal' ||
    value === 'normal' ||
    value === 'more_than_normal' ||
    value === 'not_observed'
  ) {
    return value;
  }

  if (symptom === 'none' || symptom === null) {
    return 'normal';
  }

  return 'not_observed';
}

function normalizePoop(value: string | null, symptom: string | null): Poop {
  if (
    value === 'diarrhea' ||
    value === 'soft' ||
    value === 'normal' ||
    value === 'hard' ||
    value === 'none' ||
    value === 'not_observed'
  ) {
    return value;
  }

  if (symptom === 'diarrhea') {
    return 'diarrhea';
  }

  if (symptom === 'none' || symptom === null) {
    return 'normal';
  }

  return 'not_observed';
}

function mapCheckInRow(row: CheckInRow): CheckIn {
  return {
    id: row.id,
    petId: row.pet_id,
    date: row.date,
    appetite: normalizeAppetite(row.appetite),
    waterIntake: normalizeWaterIntake(row.water_intake),
    energy: normalizeEnergy(row.energy),
    mood: normalizeMood(row.mood),
    pee: normalizePee(row.pee, row.symptom),
    poop: normalizePoop(row.poop, row.symptom),
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function getCheckInByPetIdAndDate(
  petId: string,
  date: string
): Promise<CheckIn | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<CheckInRow>(
    'SELECT * FROM check_ins WHERE pet_id = ? AND date = ?',
    petId,
    date
  );

  return row ? mapCheckInRow(row) : null;
}

export async function createCheckIn(checkIn: CheckIn): Promise<void> {
  const db = await getDatabase();
  const existing = await getCheckInByPetIdAndDate(checkIn.petId, checkIn.date);

  if (existing) {
    throw new Error('A check-in already exists for this day. Use update instead.');
  }

  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(check_ins)');
  const hasLegacySymptomColumn = columns.some((column) => column.name === 'symptom');

  if (hasLegacySymptomColumn) {
    await db.runAsync(
      `INSERT INTO check_ins (
        id, pet_id, date, appetite, water_intake, energy, mood, pee, poop, symptom, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      checkIn.id,
      checkIn.petId,
      checkIn.date,
      checkIn.appetite,
      checkIn.waterIntake,
      checkIn.energy,
      checkIn.mood,
      checkIn.pee,
      checkIn.poop,
      'none',
      checkIn.notes ?? null,
      checkIn.createdAt
    );
    return;
  }

  await db.runAsync(
    `INSERT INTO check_ins (
      id, pet_id, date, appetite, water_intake, energy, mood, pee, poop, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    checkIn.id,
    checkIn.petId,
    checkIn.date,
    checkIn.appetite,
    checkIn.waterIntake,
    checkIn.energy,
    checkIn.mood,
    checkIn.pee,
    checkIn.poop,
    checkIn.notes ?? null,
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
     SET date = ?, appetite = ?, water_intake = ?, energy = ?, mood = ?, pee = ?, poop = ?, notes = ?
     WHERE id = ?`,
    checkIn.date,
    checkIn.appetite,
    checkIn.waterIntake,
    checkIn.energy,
    checkIn.mood,
    checkIn.pee,
    checkIn.poop,
    checkIn.notes ?? null,
    checkIn.id
  );
}

export async function deleteCheckIn(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM check_ins WHERE id = ?', id);
}
