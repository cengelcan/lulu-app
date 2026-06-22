import * as SQLite from 'expo-sqlite';

import { normalizeLegacyRecordMetadata } from '@/utils/pet-record-normalize';

const DATABASE_NAME = 'pet_health_journal.db';

let database: SQLite.SQLiteDatabase | null = null;

/**
 * Migration SQL lives in storage/migrations/*.sql.
 * Schema version is tracked with PRAGMA user_version.
 *
 * Dev note: databases created before migration 002 may retain
 * idx_check_ins_pet_date until version 2 runs. If the unique constraint error
 * persists, delete the local pet_health_journal.db and restart the app.
 */
const CURRENT_SCHEMA_VERSION = 11;

const MIGRATION_001_SQL = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS pets (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  age_group TEXT NOT NULL,
  health_conditions TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS check_ins (
  id TEXT PRIMARY KEY NOT NULL,
  pet_id TEXT NOT NULL,
  date TEXT NOT NULL,
  appetite TEXT NOT NULL,
  energy TEXT NOT NULL,
  symptom TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (pet_id) REFERENCES pets (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_check_ins_pet_created_at ON check_ins (pet_id, created_at DESC);
`;

const MIGRATION_002_SQL = `
DROP INDEX IF EXISTS idx_check_ins_pet_date;
`;

async function getSchemaVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  return result?.user_version ?? 0;
}

async function setSchemaVersion(db: SQLite.SQLiteDatabase, version: number): Promise<void> {
  await db.execAsync(`PRAGMA user_version = ${version}`);
}

async function ensurePetPhotoUriColumn(db: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(pets)');
  const hasPhotoUri = columns.some((column) => column.name === 'photo_uri');

  if (!hasPhotoUri) {
    await db.execAsync('ALTER TABLE pets ADD COLUMN photo_uri TEXT;');
  }
}

async function ensureCheckInNotesColumn(db: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(check_ins)');
  const hasNotes = columns.some((column) => column.name === 'notes');

  if (!hasNotes) {
    await db.execAsync('ALTER TABLE check_ins ADD COLUMN notes TEXT;');
  }
}

async function ensureCheckInV7Columns(db: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(check_ins)');
  const existingNames = new Set(columns.map((column) => column.name));

  if (!existingNames.has('water_intake')) {
    await db.execAsync('ALTER TABLE check_ins ADD COLUMN water_intake TEXT;');
  }

  if (!existingNames.has('mood')) {
    await db.execAsync('ALTER TABLE check_ins ADD COLUMN mood TEXT;');
  }

  if (!existingNames.has('pee')) {
    await db.execAsync('ALTER TABLE check_ins ADD COLUMN pee TEXT;');
  }

  if (!existingNames.has('poop')) {
    await db.execAsync('ALTER TABLE check_ins ADD COLUMN poop TEXT;');
  }

  await db.execAsync(`
    UPDATE check_ins
    SET
      water_intake = COALESCE(water_intake, 'normal'),
      mood = COALESCE(mood, 'normal'),
      pee = COALESCE(
        pee,
        CASE
          WHEN symptom = 'none' OR symptom IS NULL THEN 'normal'
          ELSE 'not_observed'
        END
      ),
      poop = COALESCE(
        poop,
        CASE
          WHEN symptom = 'diarrhea' THEN 'diarrhea'
          WHEN symptom = 'none' OR symptom IS NULL THEN 'normal'
          ELSE 'not_observed'
        END
      ),
      appetite = CASE appetite
        WHEN 'good' THEN 'increased'
        WHEN 'not_eating' THEN 'no_appetite'
        ELSE appetite
      END,
      energy = CASE energy
        WHEN 'high' THEN 'high'
        WHEN 'low' THEN 'low'
        ELSE energy
      END
    WHERE water_intake IS NULL
       OR mood IS NULL
       OR pee IS NULL
       OR poop IS NULL
       OR appetite IN ('good', 'not_eating')
       OR energy IN ('high', 'low');
  `);
}

const PET_IDENTITY_COLUMNS = [
  { name: 'color', sql: 'ALTER TABLE pets ADD COLUMN color TEXT;' },
  { name: 'sex', sql: 'ALTER TABLE pets ADD COLUMN sex TEXT;' },
  { name: 'spay_neuter_status', sql: 'ALTER TABLE pets ADD COLUMN spay_neuter_status TEXT;' },
  { name: 'birth_date', sql: 'ALTER TABLE pets ADD COLUMN birth_date TEXT;' },
  { name: 'adoption_date', sql: 'ALTER TABLE pets ADD COLUMN adoption_date TEXT;' },
  { name: 'microchip_id', sql: 'ALTER TABLE pets ADD COLUMN microchip_id TEXT;' },
  { name: 'owner_name', sql: 'ALTER TABLE pets ADD COLUMN owner_name TEXT;' },
] as const;

async function ensurePetIdentityColumns(db: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(pets)');
  const existingNames = new Set(columns.map((column) => column.name));

  for (const column of PET_IDENTITY_COLUMNS) {
    if (!existingNames.has(column.name)) {
      await db.execAsync(column.sql);
    }
  }
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  let version = await getSchemaVersion(db);

  if (version < 1) {
    await db.execAsync(MIGRATION_001_SQL);
    version = 1;
    await setSchemaVersion(db, version);
  }

  if (version < 2) {
    await db.execAsync(MIGRATION_002_SQL);
    version = 2;
    await setSchemaVersion(db, version);
  }

  if (version < 3) {
    await ensurePetPhotoUriColumn(db);
    version = 3;
    await setSchemaVersion(db, version);
  }

  if (version < 4) {
    await ensureCheckInNotesColumn(db);
    version = 4;
    await setSchemaVersion(db, version);
  }

  if (version < 5) {
    await ensurePetIdentityColumns(db);
    version = 5;
    await setSchemaVersion(db, version);
  }

  if (version < 6) {
    await ensurePetBreedColumn(db);
    await dedupeCheckInsByPetAndDate(db);
    await db.execAsync(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_check_ins_pet_date ON check_ins (pet_id, date);'
    );
    version = 6;
    await setSchemaVersion(db, version);
  }

  if (version < 7) {
    await ensureCheckInV7Columns(db);
    version = 7;
    await setSchemaVersion(db, version);
  }

  if (version < 8) {
    await dropDeprecatedCheckInSymptomColumn(db);
    version = 8;
    await setSchemaVersion(db, version);
  }

  if (version < 9) {
    await ensurePetRecordsTable(db);
    version = 9;
    await setSchemaVersion(db, version);
  }

  if (version < 10) {
    await ensurePetStatusColumns(db);
    version = 10;
    await setSchemaVersion(db, version);
  }

  if (version < 11) {
    await migrateRecordTypes(db);
    version = 11;
    await setSchemaVersion(db, version);
  }
}

async function migrateRecordTypes(db: SQLite.SQLiteDatabase): Promise<void> {
  const rows = await db.getAllAsync<{
    id: string;
    type: string;
    metadata: string;
  }>("SELECT id, type, metadata FROM pet_records WHERE type IN ('vomiting', 'other')");

  for (const row of rows) {
    let metadata: unknown;

    try {
      metadata = JSON.parse(row.metadata);
    } catch {
      metadata = {};
    }

    const normalized = normalizeLegacyRecordMetadata(row.type, metadata);

    if (!normalized) {
      continue;
    }

    await db.runAsync(
      'UPDATE pet_records SET type = ?, metadata = ? WHERE id = ?',
      normalized.type,
      JSON.stringify(normalized.metadata),
      row.id
    );
  }
}

async function ensurePetStatusColumns(db: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(pets)');
  const existingNames = new Set(columns.map((column) => column.name));

  if (!existingNames.has('status')) {
    await db.execAsync("ALTER TABLE pets ADD COLUMN status TEXT NOT NULL DEFAULT 'active';");
  }

  if (!existingNames.has('deceased_at')) {
    await db.execAsync('ALTER TABLE pets ADD COLUMN deceased_at TEXT;');
  }
}

async function ensurePetRecordsTable(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS pet_records (
      id TEXT PRIMARY KEY NOT NULL,
      pet_id TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (pet_id) REFERENCES pets (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_pet_records_pet_date ON pet_records (pet_id, date DESC);
    CREATE INDEX IF NOT EXISTS idx_pet_records_pet_type ON pet_records (pet_id, type);
  `);
}

async function dropDeprecatedCheckInSymptomColumn(db: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(check_ins)');
  const hasSymptom = columns.some((column) => column.name === 'symptom');

  if (!hasSymptom) {
    return;
  }

  await db.execAsync(`
    PRAGMA foreign_keys = OFF;

    CREATE TABLE check_ins_v8 (
      id TEXT PRIMARY KEY NOT NULL,
      pet_id TEXT NOT NULL,
      date TEXT NOT NULL,
      appetite TEXT NOT NULL,
      water_intake TEXT,
      energy TEXT NOT NULL,
      mood TEXT,
      pee TEXT,
      poop TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (pet_id) REFERENCES pets (id) ON DELETE CASCADE
    );

    INSERT INTO check_ins_v8 (
      id, pet_id, date, appetite, water_intake, energy, mood, pee, poop, notes, created_at
    )
    SELECT
      id, pet_id, date, appetite, water_intake, energy, mood, pee, poop, notes, created_at
    FROM check_ins;

    DROP TABLE check_ins;
    ALTER TABLE check_ins_v8 RENAME TO check_ins;

    CREATE INDEX IF NOT EXISTS idx_check_ins_pet_created_at ON check_ins (pet_id, created_at DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_check_ins_pet_date ON check_ins (pet_id, date);

    PRAGMA foreign_keys = ON;
  `);
}

async function ensurePetBreedColumn(db: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(pets)');
  const hasBreed = columns.some((column) => column.name === 'breed');

  if (!hasBreed) {
    await db.execAsync('ALTER TABLE pets ADD COLUMN breed TEXT;');
  }
}

async function dedupeCheckInsByPetAndDate(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    DELETE FROM check_ins
    WHERE id IN (
      SELECT ci.id
      FROM check_ins ci
      WHERE ci.created_at < (
        SELECT MAX(created_at)
        FROM check_ins
        WHERE pet_id = ci.pet_id AND date = ci.date
      )
    );
  `);
}

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database) {
    return database;
  }

  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await runMigrations(db);
  database = db;
  return db;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!database) {
    return initDatabase();
  }

  return database;
}
