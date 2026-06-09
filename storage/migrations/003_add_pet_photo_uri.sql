-- Add optional profile photo URI for pets.
-- Existing databases receive the column via idempotent migration logic in database.ts.

ALTER TABLE pets ADD COLUMN photo_uri TEXT;
