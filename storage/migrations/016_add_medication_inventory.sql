CREATE TABLE IF NOT EXISTS medication_inventory (
  plan_id TEXT PRIMARY KEY NOT NULL,
  pet_id TEXT NOT NULL,
  remaining_doses INTEGER NOT NULL DEFAULT 0 CHECK (remaining_doses >= 0),
  refill_threshold INTEGER NOT NULL DEFAULT 3 CHECK (refill_threshold >= 0),
  updated_at TEXT NOT NULL,
  FOREIGN KEY (plan_id) REFERENCES medication_plans (id) ON DELETE CASCADE,
  FOREIGN KEY (pet_id) REFERENCES pets (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_medication_inventory_pet ON medication_inventory (pet_id);
