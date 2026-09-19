PRAGMA foreign_keys = OFF;

ALTER TABLE enrollments
ADD COLUMN course_id INTEGER;

UPDATE enrollments
SET course_id = (
  SELECT course_id
  FROM batches
  WHERE batches.id = enrollments.batch_id
);

PRAGMA foreign_keys = ON;