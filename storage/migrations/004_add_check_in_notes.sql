-- Add optional free-text notes to check-ins.
-- Existing rows receive NULL via idempotent migration logic in database.ts.

ALTER TABLE check_ins ADD COLUMN notes TEXT;
