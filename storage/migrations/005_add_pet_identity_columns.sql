-- Add optional pet identity columns.
-- Existing databases receive columns via idempotent migration logic in database.ts.

ALTER TABLE pets ADD COLUMN color TEXT;
ALTER TABLE pets ADD COLUMN sex TEXT;
ALTER TABLE pets ADD COLUMN spay_neuter_status TEXT;
ALTER TABLE pets ADD COLUMN birth_date TEXT;
ALTER TABLE pets ADD COLUMN adoption_date TEXT;
ALTER TABLE pets ADD COLUMN microchip_id TEXT;
ALTER TABLE pets ADD COLUMN owner_name TEXT;
