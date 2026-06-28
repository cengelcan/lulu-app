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
    case 'less':
    case 'normal':
    case 'more':
      return value;
    case 'no_appetite':
    case 'reduced':
    case 'not_eating':
      return 'less';
    case 'increased':
    case 'good':
      return 'more';
    default:
      return 'normal';
  }
}

function normalizeEnergy(value: string): Energy {
  switch (value) {
    case 'low':
    case 'normal':
    case 'high':
      return value;
    case 'very_low':
      return 'low';
    case 'very_high':
      return 'high';
    default:
      return 'normal';
  }
}

function normalizeWaterIntake(value: string | null): WaterIntake {
  switch (value) {
    case 'less':
    case 'normal':
    case 'more':
      return value;
    case 'very_low':
    case 'low':
      return 'less';
    case 'high':
    case 'very_high':
      return 'more';
    default:
      return 'normal';
  }
}

function normalizeMood(value: string | null): Mood {
  switch (value) {
    case 'low':
    case 'normal':
    case 'high':
      return value;
    case 'restless':
    case 'irritable':
      return 'low';
    case 'happy':
    case 'playful':
      return 'high';
    default:
      return 'normal';
  }
}

function normalizePee(value: string | null, symptom: string | null): Pee {
  switch (value) {
    case 'not_observed':
    case 'normal':
    case 'not_normal':
      return value;
    case 'straining':
    case 'less_than_normal':
    case 'more_than_normal':
      return 'not_normal';
    default:
      break;
  }

  if (symptom === 'none' || symptom === null) {
    return 'normal';
  }

  return 'not_observed';
}

function normalizePoop(value: string | null, symptom: string | null): Poop {
  switch (value) {
    case 'not_observed':
    case 'normal':
    case 'not_normal':
      return value;
    case 'diarrhea':
    case 'soft':
    case 'hard':
    case 'none':
      return 'not_normal';
    default:
      break;
  }

  if (symptom === 'diarrhea') {
    return 'not_normal';
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

export async function getAllCheckIns(): Promise<CheckIn[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CheckInRow>(
    'SELECT * FROM check_ins ORDER BY created_at DESC'
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

export async function deleteAllCheckIns(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync('DELETE FROM check_ins');
}
