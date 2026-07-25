ALTER TABLE vet_visits ADD COLUMN created_by_user_id TEXT;
ALTER TABLE vet_visit_outcomes ADD COLUMN follow_up_reminder_id TEXT;
ALTER TABLE vet_visit_outcomes ADD COLUMN medication_plan_id TEXT;
