-- Allow multiple check-ins per pet on the same calendar day.
-- Existing dev databases created before this migration may still have
-- idx_check_ins_pet_date from 001_initial.sql. Drop it on upgrade.
--
-- If you still see "unique constraint failed: check_ins.pet_id, check_ins.date"
-- after updating, reset the local SQLite database:
-- - iOS Simulator: delete the app or remove pet_health_journal.db
-- - Android emulator/device: clear app storage / uninstall and reinstall
-- - Expo Go: clear app data for the project

DROP INDEX IF EXISTS idx_check_ins_pet_date;
