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
