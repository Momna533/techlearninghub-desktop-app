ALTER TABLE courses
ADD COLUMN total_sessions INTEGER
CHECK (total_sessions IS NULL OR total_sessions > 0);

ALTER TABLE courses
ADD COLUMN sessions_per_week INTEGER
CHECK (sessions_per_week IS NULL OR sessions_per_week > 0);

ALTER TABLE courses
ADD COLUMN modules_json TEXT NOT NULL DEFAULT '[]';