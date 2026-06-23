CREATE TABLE IF NOT EXISTS pet_reminders (
  id TEXT PRIMARY KEY NOT NULL,
  pet_id TEXT NOT NULL,
  type TEXT NOT NULL,
  due_date TEXT NOT NULL,
  due_time TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TEXT,
  record_id TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (pet_id) REFERENCES pets (id) ON DELETE CASCADE,
  FOREIGN KEY (record_id) REFERENCES pet_records (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pet_reminders_pet_due_date ON pet_reminders (pet_id, due_date DESC);
CREATE INDEX IF NOT EXISTS idx_pet_reminders_pet_status ON pet_reminders (pet_id, status);
CREATE INDEX IF NOT EXISTS idx_pet_reminders_pet_type ON pet_reminders (pet_id, type);
