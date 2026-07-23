CREATE TABLE IF NOT EXISTS activity_events_cache (
  id TEXT PRIMARY KEY NOT NULL,
  family_id TEXT,
  pet_id TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  entity_id TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  metadata_version INTEGER NOT NULL DEFAULT 1,
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_events_cache_occurred
  ON activity_events_cache (occurred_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_activity_events_cache_pet
  ON activity_events_cache (pet_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_events_cache_actor
  ON activity_events_cache (actor_user_id, occurred_at DESC);
