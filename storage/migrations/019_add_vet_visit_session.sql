ALTER TABLE vet_visits ADD COLUMN general_notes TEXT;

CREATE TABLE IF NOT EXISTS vet_visit_outcomes (
  visit_id TEXT PRIMARY KEY NOT NULL,
  user_entered_summary TEXT NOT NULL,
  treatment_notes TEXT,
  next_visit_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (visit_id) REFERENCES vet_visits (id) ON DELETE CASCADE
);
