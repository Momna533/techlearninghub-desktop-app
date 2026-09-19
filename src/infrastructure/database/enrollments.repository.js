const { getDatabase } = require("./connection");

function mapEnrollment(row) {
  if (!row) return null;

  return {
    id: row.id,

    studentId: row.student_id,
    studentCode: row.student_code,
    studentName: row.student_name,

    batchId: row.batch_id,
    batchCode: row.batch_code,
    batchName: row.batch_name,

    courseId: row.course_id,
    courseCode: row.course_code,
    courseName: row.course_name,

    trainerEmployeeId: row.trainer_employee_id,
    trainerName: row.trainer_name,

    enrolledAt: row.enrolled_at,
    withdrawnAt: row.withdrawn_at,

    status: row.status,

    agreedFeeMinor: row.agreed_fee_minor,
    discountMinor: row.discount_minor,
    currencyCode: row.currency_code,

    notes: row.notes,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const ENROLLMENT_SELECT = `
  SELECT
    en.id,

    en.student_id,
    TRIM(s.first_name || ' ' || s.last_name) AS student_name,
    s.student_code,

    en.batch_id,
    b.batch_code,
    b.name AS batch_name,

    en.course_id,
    c.course_code,
    c.name AS course_name,

    b.trainer_employee_id,
    TRIM(e.first_name || ' ' || e.last_name) AS trainer_name,

    en.enrolled_at,
    en.withdrawn_at,
    en.status,
    en.agreed_fee_minor,
    en.discount_minor,
    en.currency_code,
    en.notes,
    en.created_at,
    en.updated_at

  FROM enrollments en

  INNER JOIN students s
    ON s.id = en.student_id

 LEFT JOIN batches b
  ON b.id = en.batch_id

LEFT JOIN courses c
  ON c.id = en.course_id

  LEFT JOIN employees e
    ON e.id = b.trainer_employee_id
`;

function findEnrollments({
  search = "",
  studentId = "all",
  batchId = "all",
  courseId = "all",
  status = "all",
} = {}) {
  const database = getDatabase();

  const conditions = [];
  const parameters = {};

  if (search.trim()) {
    conditions.push(`
      (
        s.student_code LIKE $search
        OR s.first_name LIKE $search
        OR s.last_name LIKE $search
        OR b.batch_code LIKE $search
        OR b.name LIKE $search
        OR c.course_code LIKE $search
        OR c.name LIKE $search
      )
    `);

    parameters.search = `%${search.trim()}%`;
  }

  if (studentId !== "all") {
    conditions.push("en.student_id = $studentId");
    parameters.studentId = Number(studentId);
  }

  if (batchId !== "all") {
    conditions.push("en.batch_id = $batchId");
    parameters.batchId = Number(batchId);
  }

  if (courseId !== "all") {
    conditions.push("b.course_id = $courseId");
    parameters.courseId = Number(courseId);
  }

  if (status !== "all") {
    conditions.push("en.status = $status");
    parameters.status = status;
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const rows = database
    .prepare(
      `
      ${ENROLLMENT_SELECT}
      ${whereClause}
      ORDER BY en.enrolled_at DESC, s.last_name ASC, s.first_name ASC
    `,
    )
    .all(parameters);

  return rows.map(mapEnrollment);
}

function findEnrollmentById(id) {
  const database = getDatabase();

  const row = database
    .prepare(
      `
      ${ENROLLMENT_SELECT}
      WHERE en.id = ?
      LIMIT 1
    `,
    )
    .get(id);

  return mapEnrollment(row);
}

function findEnrollmentByStudentAndBatch(studentId, batchId) {
  const database = getDatabase();

  const row = database
    .prepare(
      `
      ${ENROLLMENT_SELECT}
      WHERE en.student_id = ?
        AND en.batch_id = ?
      LIMIT 1
    `,
    )
    .get(studentId, batchId);

  return mapEnrollment(row);
}

function findStudentEnrollments(studentId) {
  const database = getDatabase();

  const rows = database
    .prepare(
      `
      ${ENROLLMENT_SELECT}
      WHERE en.student_id = ?
      ORDER BY en.enrolled_at DESC
    `,
    )
    .all(studentId);

  return rows.map(mapEnrollment);
}

function findBatchEnrollments(batchId) {
  const database = getDatabase();

  const rows = database
    .prepare(
      `
      ${ENROLLMENT_SELECT}
      WHERE en.batch_id = ?
      ORDER BY en.enrolled_at ASC, s.last_name ASC, s.first_name ASC
    `,
    )
    .all(batchId);

  return rows.map(mapEnrollment);
}

function countActiveEnrollments(batchId) {
  const database = getDatabase();

  const row = database
    .prepare(
      `
      SELECT COUNT(*) AS count
      FROM enrollments
      WHERE batch_id = ?
        AND status IN ('pending', 'active')
    `,
    )
    .get(batchId);

  return Number(row.count || 0);
}

function createEnrollment(enrollment) {
  const database = getDatabase();

  const result = database
    .prepare(
      `
      INSERT INTO enrollments (
        student_id,
        batch_id,
        enrolled_at,
        status,
        agreed_fee_minor,
        discount_minor,
        currency_code,
        notes
      )
      VALUES (
        @studentId,
        @batchId,
        @enrolledAt,
        @status,
        @agreedFeeMinor,
        @discountMinor,
        @currencyCode,
        @notes
      )
    `,
    )
    .run({
      studentId: enrollment.studentId,
      batchId: enrollment.batchId,
      enrolledAt: enrollment.enrolledAt,
      status: enrollment.status,
      agreedFeeMinor: enrollment.agreedFeeMinor,
      discountMinor: enrollment.discountMinor,
      currencyCode: enrollment.currencyCode,
      notes: enrollment.notes,
    });

  return findEnrollmentById(Number(result.lastInsertRowid));
}

function updateEnrollment(id, enrollment) {
  const database = getDatabase();

  database
    .prepare(
      `
      UPDATE enrollments
      SET
       course_id = @courseId,
  batch_id = @batchId,
  enrolled_at = @enrolledAt,
        withdrawn_at = @withdrawnAt,
        status = @status,
        agreed_fee_minor = @agreedFeeMinor,
        discount_minor = @discountMinor,
        currency_code = @currencyCode,
        notes = @notes,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `,
    )
    .run({
      id,
      courseId: enrollment.courseId,
      batchId: enrollment.batchId,
      enrolledAt: enrollment.enrolledAt,
      withdrawnAt: enrollment.withdrawnAt,
      status: enrollment.status,
      agreedFeeMinor: enrollment.agreedFeeMinor,
      discountMinor: enrollment.discountMinor,
      currencyCode: enrollment.currencyCode,
      notes: enrollment.notes,
    });

  return findEnrollmentById(id);
}

function updateEnrollmentStatus(id, status, withdrawnAt = null) {
  const database = getDatabase();

  database
    .prepare(
      `
      UPDATE enrollments
      SET
        status = @status,
        withdrawn_at = @withdrawnAt,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `,
    )
    .run({
      id,
      status,
      withdrawnAt,
    });

  return findEnrollmentById(id);
}

module.exports = {
  findEnrollments,
  findEnrollmentById,
  findEnrollmentByStudentAndBatch,
  findStudentEnrollments,
  findBatchEnrollments,
  countActiveEnrollments,
  createEnrollment,
  updateEnrollment,
  updateEnrollmentStatus,
};
