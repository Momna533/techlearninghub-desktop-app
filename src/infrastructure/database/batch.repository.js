const { getDatabase } = require("./connection");

function parseSchedule(scheduleJson) {
  if (!scheduleJson) {
    return {
      days: [],
      startTime: "",
      endTime: "",
      room: "",
    };
  }

  try {
    const schedule = JSON.parse(scheduleJson);

    return {
      days: Array.isArray(schedule.days) ? schedule.days : [],
      startTime: schedule.startTime || "",
      endTime: schedule.endTime || "",
      room: schedule.room || "",
    };
  } catch {
    return {
      days: [],
      startTime: "",
      endTime: "",
      room: "",
    };
  }
}

function mapBatch(row) {
  if (!row) return null;

  const schedule = parseSchedule(row.schedule_json);

  return {
    id: row.id,
    batchCode: row.batch_code,
    name: row.name,

    courseId: row.course_id,
    courseCode: row.course_code,
    courseName: row.course_name,

    trainerEmployeeId: row.trainer_employee_id,
    trainerEmployeeCode: row.trainer_employee_code,
    trainerName: row.trainer_name,

    startDate: row.start_date,
    endDate: row.end_date,

    days: schedule.days,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    room: schedule.room,

    capacity: row.capacity,

    feeMinor: row.fee_minor,
    currencyCode: row.currency_code,

    status: row.status,

    enrolledCount: Number(row.enrolled_count || 0),

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const BATCH_SELECT = `
  SELECT
    b.id,
    b.course_id,
    b.trainer_employee_id,
    b.batch_code,
    b.name,
    b.start_date,
    b.end_date,
    b.capacity,
    b.schedule_json,
    b.fee_minor,
    b.currency_code,
    b.status,
    b.created_at,
    b.updated_at,

    c.course_code,
    c.name AS course_name,

    e.employee_code AS trainer_employee_code,
    TRIM(e.first_name || ' ' || e.last_name) AS trainer_name,

    (
      SELECT COUNT(*)
      FROM enrollments en
      WHERE en.batch_id = b.id
        AND en.status IN ('pending', 'active')
    ) AS enrolled_count

  FROM batches b

  INNER JOIN courses c
    ON c.id = b.course_id

  LEFT JOIN employees e
    ON e.id = b.trainer_employee_id
`;

function findBatches({
  search = "",
  courseId = "all",
  trainerEmployeeId = "all",
  status = "all",
} = {}) {
  const database = getDatabase();

  const conditions = [];
  const parameters = {};

  if (search.trim()) {
    conditions.push(`
      (
        b.batch_code LIKE $search
        OR b.name LIKE $search
        OR c.course_code LIKE $search
        OR c.name LIKE $search
        OR e.employee_code LIKE $search
        OR e.first_name LIKE $search
        OR e.last_name LIKE $search
      )
    `);

    parameters.search = `%${search.trim()}%`;
  }

  if (courseId !== "all") {
    conditions.push("b.course_id = $courseId");
    parameters.courseId = Number(courseId);
  }

  if (trainerEmployeeId !== "all") {
    conditions.push("b.trainer_employee_id = $trainerEmployeeId");
    parameters.trainerEmployeeId = Number(trainerEmployeeId);
  }

  if (status !== "all") {
    conditions.push("b.status = $status");
    parameters.status = status;
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const rows = database
    .prepare(
      `
        ${BATCH_SELECT}

        ${whereClause}

        ORDER BY b.start_date DESC, b.name ASC
      `,
    )
    .all(parameters);

  return rows.map(mapBatch);
}

function findBatchById(id) {
  const database = getDatabase();

  const row = database
    .prepare(
      `
        ${BATCH_SELECT}

        WHERE b.id = ?

        LIMIT 1
      `,
    )
    .get(id);

  return mapBatch(row);
}

function findBatchByCode(batchCode) {
  const database = getDatabase();

  const row = database
    .prepare(
      `
        ${BATCH_SELECT}

        WHERE b.batch_code = ?

        LIMIT 1
      `,
    )
    .get(batchCode.trim());

  return mapBatch(row);
}

function createBatch(batch) {
  const database = getDatabase();

  const result = database
    .prepare(
      `
        INSERT INTO batches (
          course_id,
          trainer_employee_id,
          batch_code,
          name,
          start_date,
          end_date,
          capacity,
          schedule_json,
          fee_minor,
          currency_code,
          status
        )
        VALUES (
          @courseId,
          @trainerEmployeeId,
          @batchCode,
          @name,
          @startDate,
          @endDate,
          @capacity,
          @scheduleJson,
          @feeMinor,
          @currencyCode,
          @status
        )
      `,
    )
    .run({
      courseId: batch.courseId,
      trainerEmployeeId: batch.trainerEmployeeId,
      batchCode: batch.batchCode,
      name: batch.name,
      startDate: batch.startDate,
      endDate: batch.endDate,
      capacity: batch.capacity,
      scheduleJson: JSON.stringify({
        days: batch.days,
        startTime: batch.startTime,
        endTime: batch.endTime,
        room: batch.room,
      }),
      feeMinor: batch.feeMinor,
      currencyCode: batch.currencyCode,
      status: batch.status,
    });

  return findBatchById(Number(result.lastInsertRowid));
}

function updateBatch(id, batch) {
  const database = getDatabase();

  database
    .prepare(
      `
        UPDATE batches
        SET
          course_id = @courseId,
          trainer_employee_id = @trainerEmployeeId,
          batch_code = @batchCode,
          name = @name,
          start_date = @startDate,
          end_date = @endDate,
          capacity = @capacity,
          schedule_json = @scheduleJson,
          fee_minor = @feeMinor,
          currency_code = @currencyCode,
          status = @status,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
      `,
    )
    .run({
      id,
      courseId: batch.courseId,
      trainerEmployeeId: batch.trainerEmployeeId,
      batchCode: batch.batchCode,
      name: batch.name,
      startDate: batch.startDate,
      endDate: batch.endDate,
      capacity: batch.capacity,
      scheduleJson: JSON.stringify({
        days: batch.days,
        startTime: batch.startTime,
        endTime: batch.endTime,
        room: batch.room,
      }),
      feeMinor: batch.feeMinor,
      currencyCode: batch.currencyCode,
      status: batch.status,
    });

  return findBatchById(id);
}

function findActiveCourses() {
  const database = getDatabase();

  return database
    .prepare(
      `
        SELECT
          id,
          course_code,
          name,
          status
        FROM courses
        WHERE status = 'active'
        ORDER BY name ASC
      `,
    )
    .all()
    .map((row) => ({
      id: row.id,
      courseCode: row.course_code,
      name: row.name,
      status: row.status,
    }));
}

function findTrainerEmployees() {
  const database = getDatabase();

  return database
    .prepare(
      `
        SELECT
          id,
          employee_code,
          first_name,
          last_name,
          email,
          job_title,
          department,
          employment_status
        FROM employees
        WHERE employment_status = 'active'
        ORDER BY first_name ASC, last_name ASC
      `,
    )
    .all()
    .map((row) => ({
      id: row.id,
      employeeCode: row.employee_code,
      firstName: row.first_name,
      lastName: row.last_name,
      name: `${row.first_name} ${row.last_name}`.trim(),
      email: row.email,
      jobTitle: row.job_title,
      department: row.department,
      employmentStatus: row.employment_status,
    }));
}

module.exports = {
  findBatches,
  findBatchById,
  findBatchByCode,
  createBatch,
  updateBatch,
  findActiveCourses,
  findTrainerEmployees,
};
