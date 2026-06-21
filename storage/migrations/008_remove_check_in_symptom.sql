-- Deprecated symptom column replaced by pee + poop (see migration 006).
-- Rebuild table without symptom to drop the NOT NULL constraint cleanly.

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
