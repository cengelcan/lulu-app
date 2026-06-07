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
