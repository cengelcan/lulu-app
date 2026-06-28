-- Simplify check-in category values to 3-option model
UPDATE check_ins
SET appetite = CASE appetite
  WHEN 'no_appetite' THEN 'less'
  WHEN 'reduced' THEN 'less'
  WHEN 'increased' THEN 'more'
  WHEN 'good' THEN 'more'
  WHEN 'not_eating' THEN 'less'
  ELSE appetite
END;

UPDATE check_ins
SET water_intake = CASE water_intake
  WHEN 'very_low' THEN 'less'
  WHEN 'low' THEN 'less'
  WHEN 'high' THEN 'more'
  WHEN 'very_high' THEN 'more'
  ELSE water_intake
END;

UPDATE check_ins
SET poop = CASE poop
  WHEN 'diarrhea' THEN 'not_normal'
  WHEN 'soft' THEN 'not_normal'
  WHEN 'hard' THEN 'not_normal'
  WHEN 'none' THEN 'not_normal'
  ELSE poop
END;

UPDATE check_ins
SET pee = CASE pee
  WHEN 'straining' THEN 'not_normal'
  WHEN 'less_than_normal' THEN 'not_normal'
  WHEN 'more_than_normal' THEN 'not_normal'
  ELSE pee
END;

UPDATE check_ins
SET energy = CASE energy
  WHEN 'very_low' THEN 'low'
  WHEN 'very_high' THEN 'high'
  ELSE energy
END;

UPDATE check_ins
SET mood = CASE mood
  WHEN 'restless' THEN 'low'
  WHEN 'irritable' THEN 'low'
  WHEN 'happy' THEN 'high'
  WHEN 'playful' THEN 'high'
  ELSE mood
END;
