CREATE TABLE IF NOT EXISTS medication_plans (
  id TEXT PRIMARY KEY NOT NULL,
  pet_id TEXT NOT NULL,
  name TEXT NOT NULL,
  form TEXT,
  dosage TEXT NOT NULL,
  unit TEXT NOT NULL,
  instructions TEXT,
  starts_on TEXT NOT NULL,
  ends_on TEXT,
  timezone TEXT NOT NULL,
  is_prn INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (pet_id) REFERENCES pets (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medication_schedules (
  id TEXT PRIMARY KEY NOT NULL,
  plan_id TEXT NOT NULL,
  frequency TEXT NOT NULL,
  interval_value INTEGER NOT NULL DEFAULT 1,
  weekdays TEXT NOT NULL DEFAULT '[]',
  times TEXT NOT NULL DEFAULT '[]',
  effective_from TEXT NOT NULL,
  effective_to TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (plan_id) REFERENCES medication_plans (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medication_doses (
  id TEXT PRIMARY KEY NOT NULL,
  plan_id TEXT NOT NULL,
  schedule_id TEXT,
  pet_id TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  local_date TEXT NOT NULL,
  local_time TEXT NOT NULL,
  timezone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  completed_at TEXT,
  actor_user_id TEXT,
  note TEXT,
  snoozed_until TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (plan_id) REFERENCES medication_plans (id) ON DELETE CASCADE,
  FOREIGN KEY (schedule_id) REFERENCES medication_schedules (id) ON DELETE SET NULL,
  FOREIGN KEY (pet_id) REFERENCES pets (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_medication_plans_pet_status ON medication_plans (pet_id, status);
CREATE INDEX IF NOT EXISTS idx_medication_schedules_plan ON medication_schedules (plan_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_medication_doses_plan_scheduled ON medication_doses (plan_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_medication_doses_pet_status_scheduled ON medication_doses (pet_id, status, scheduled_at);
