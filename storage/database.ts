import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'pet_health_journal.db';

let database: SQLite.SQLiteDatabase | null = null;

/**
 * Migration SQL lives in storage/migrations/*.sql.
 * Keep these constants in sync when migration files change.
 *
 * Dev note: databases created before migration 002 may retain
 * idx_check_ins_pet_date until 002 runs. If the unique constraint error
 * persists, delete the local pet_health_journal.db and restart the app.
 */
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

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(MIGRATION_001_SQL);
  await db.execAsync(MIGRATION_002_SQL);
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
