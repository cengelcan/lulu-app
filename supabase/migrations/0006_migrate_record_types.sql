-- Migrate legacy pet record types to the expanded symptom-based model.

update public.pet_records
set
  type = 'symptom',
  metadata = jsonb_strip_nulls(
    jsonb_build_object(
      'symptomName', '',
      'severity', metadata->'severity'
    )
  )
where type = 'vomiting';

update public.pet_records
set
  type = 'symptom',
  metadata = jsonb_strip_nulls(
    jsonb_build_object(
      'symptomName', coalesce(nullif(trim(metadata->>'title'), ''), ''),
      'severity', null
    )
  )
where type = 'other';
