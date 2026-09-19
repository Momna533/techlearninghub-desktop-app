PRAGMA foreign_keys = OFF;

CREATE TABLE enrollments_new (
  id INTEGER PRIMARY KEY,

  student_id INTEGER NOT NULL,

  batch_id INTEGER,

  enrolled_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  withdrawn_at TEXT,

  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('pending', 'active', 'completed', 'withdrawn', 'cancelled')),

  agreed_fee_minor INTEGER NOT NULL
    CHECK (agreed_fee_minor >= 0),

  discount_minor INTEGER NOT NULL DEFAULT 0
    CHECK (discount_minor >= 0),

  currency_code TEXT NOT NULL,

  notes TEXT,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (student_id, batch_id),

  CHECK (discount_minor <= agreed_fee_minor),

  CHECK (withdrawn_at IS NULL OR withdrawn_at >= enrolled_at),

  FOREIGN KEY (student_id)
    REFERENCES students(id)
    ON DELETE RESTRICT,

  FOREIGN KEY (batch_id)
    REFERENCES batches(id)
    ON DELETE RESTRICT
);

INSERT INTO enrollments_new (
  id,
  student_id,
  batch_id,
  enrolled_at,
  withdrawn_at,
  status,
  agreed_fee_minor,
  discount_minor,
  currency_code,
  notes,
  created_at,
  updated_at
)
SELECT
  id,
  student_id,
  batch_id,
  enrolled_at,
  withdrawn_at,
  status,
  agreed_fee_minor,
  discount_minor,
  currency_code,
  notes,
  created_at,
  updated_at
FROM enrollments;

DROP TABLE enrollments;

ALTER TABLE enrollments_new RENAME TO enrollments;

PRAGMA foreign_keys = ON;