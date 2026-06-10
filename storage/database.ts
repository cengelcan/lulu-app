import * as SQLite from 'expo-sqlite';

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
const CURRENT_SCHEMA_VERSION = 5;

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

  if (version < CURRENT_SCHEMA_VERSION) {
    await ensurePetIdentityColumns(db);
    await setSchemaVersion(db, CURRENT_SCHEMA_VERSION);
  }
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
