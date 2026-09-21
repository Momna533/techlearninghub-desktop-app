ALTER TABLE enrollments
ADD COLUMN registration_fee_minor INTEGER NOT NULL DEFAULT 0
CHECK (registration_fee_minor >= 0);

ALTER TABLE student_payments
ADD COLUMN fee_type TEXT NOT NULL DEFAULT 'course'
CHECK (fee_type IN ('registration', 'course'));

CREATE INDEX idx_student_payments_enrollment_fee_type
ON student_payments(enrollment_id, fee_type);