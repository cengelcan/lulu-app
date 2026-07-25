CREATE TABLE IF NOT EXISTS vet_visits (
  id TEXT PRIMARY KEY NOT NULL,
  pet_id TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  provider_id TEXT,
  provider_name TEXT,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned',
  health_report_start_date TEXT,
  health_report_end_date TEXT,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (pet_id) REFERENCES pets (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vet_visit_questions (
  id TEXT PRIMARY KEY NOT NULL,
  visit_id TEXT NOT NULL,
  text TEXT NOT NULL,
  answer TEXT,
  is_answered INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (visit_id) REFERENCES vet_visits (id) ON DELETE CASCADE
);
